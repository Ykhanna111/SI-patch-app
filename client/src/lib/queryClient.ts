import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { fetchCsrfToken, setCsrfToken, getCachedCsrfToken } from "@/hooks/useCsrf";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    
    try {
      const data = await res.json();
      message = data.message || message;
      code = data.code;
    } catch (e) {
      // Fallback to text if not JSON
      try {
        const text = await res.text();
        if (text) message = text;
      } catch (e2) {}
    }
    
    const error = new Error(`${res.status}: ${message}`) as any;
    error.status = res.status;
    error.code = code;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const skipCsrfEndpoints = ['/api/auth/login', '/api/auth/register'];
  const requiresCsrf = method !== "GET" && method !== "HEAD" && !skipCsrfEndpoints.includes(url);
  
  const performRequest = async (currentHeaders: Record<string, string>) => {
    return await fetch(url, {
      method,
      headers: currentHeaders,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  };

  if (requiresCsrf) {
    try {
      let csrfToken = getCachedCsrfToken();
      if (!csrfToken) {
        csrfToken = await fetchCsrfToken();
      }
      headers["X-CSRF-Token"] = csrfToken;
    } catch (e) {
      console.warn("Could not fetch CSRF token:", e);
    }
  }
  
  let res = await performRequest(headers);

  // Auto-recovery for CSRF errors
  if (res.status === 403 && requiresCsrf) {
    try {
      const clone = res.clone();
      const body = await clone.json();
      if (body.code === 'CSRF_INVALID') {
        console.log("CSRF token expired, attempting recovery...");
        const newToken = await fetchCsrfToken();
        headers["X-CSRF-Token"] = newToken;
        res = await performRequest(headers);
      }
    } catch (e) {
      // Not a CSRF JSON error, proceed with original response
    }
  }

  await throwIfResNotOk(res);
  return res;
}

export function updateCsrfFromResponse(response: { csrfToken?: string }): void {
  if (response.csrfToken) {
    setCsrfToken(response.csrfToken);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
