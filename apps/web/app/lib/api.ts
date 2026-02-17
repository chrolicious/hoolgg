// API Client — Typed fetch wrapper for hool.gg backend services
// Handles JWT cookie auth, auto-refresh on 401, and typed errors

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const GUILD_API_URL =
  process.env.NEXT_PUBLIC_GUILD_API_URL || 'http://localhost:5000';
const PROGRESS_API_URL =
  process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:5001';
const RECRUITMENT_API_URL =
  process.env.NEXT_PUBLIC_RECRUITMENT_API_URL || 'http://localhost:5002';

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  params?: Record<string, string>;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${GUILD_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = new URL(path, baseUrl);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const { params: _, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const doFetch = async (): Promise<Response> => {
    return fetch(url.toString(), {
      method,
      credentials: 'include',
      ...fetchOptions,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // Auto-refresh: if 401, attempt token refresh and retry once
  if (res.status === 401) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errorBody = await res.json();
      if (errorBody.message) {
        message = errorBody.message;
      } else if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Response body is not JSON, use default message
    }
    throw new ApiError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function createClient(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, 'GET', path, undefined, options);
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, 'POST', path, body, options);
    },
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, 'PUT', path, body, options);
    },
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, 'DELETE', path, undefined, options);
    },
  };
}

// Pre-configured clients for each service
export const guildApi = createClient(GUILD_API_URL);
export const progressApi = createClient(PROGRESS_API_URL);
export const recruitmentApi = createClient(RECRUITMENT_API_URL);

// Convenience: default export is the guild API since it's used most
export const api = guildApi;
