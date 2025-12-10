import { useQuery } from "@tanstack/react-query";

interface CsrfResponse {
  csrfToken: string;
}

export function useCsrf() {
  const { data, isLoading, refetch } = useQuery<CsrfResponse>({
    queryKey: ["/api/csrf-token"],
    queryFn: async () => {
      const res = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch CSRF token");
      }
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
  });

  return {
    csrfToken: data?.csrfToken,
    isLoading,
    refetch,
  };
}

let cachedCsrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string> {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }
  
  const res = await fetch("/api/csrf-token", {
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }
  
  const data = await res.json();
  cachedCsrfToken = data.csrfToken;
  return data.csrfToken;
}

export function setCsrfToken(token: string): void {
  cachedCsrfToken = token;
}

export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

export function getCachedCsrfToken(): string | null {
  return cachedCsrfToken;
}
