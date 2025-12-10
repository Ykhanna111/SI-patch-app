import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { fetchCsrfToken, setCsrfToken, getCachedCsrfToken } from "@/hooks/useCsrf";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

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
