// Environment configuration for API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'cl_access_token';
const REFRESH_TOKEN_KEY = 'cl_refresh_token';

// Token management
export const tokenManager = {
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    clearTokens: () => {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    isAuthenticated: (): boolean => {
        return !!tokenManager.getAccessToken();
    }
};

// API Error class
export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: unknown
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
    }
}

// Refresh token function
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            tokenManager.clearTokens();
            return null;
        }

        const data = await response.json();
        tokenManager.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch {
        tokenManager.clearTokens();
        return null;
    }
}

// HTTP request options type
interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

// Main API client
export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
    };

    // Add authorization header if not skipped
    if (!skipAuth) {
        let token = tokenManager.getAccessToken();

        // If no token, try to refresh
        if (!token) {
            token = await refreshAccessToken();
        }

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    // Handle 401 - try token refresh once
    if (response.status === 401 && !skipAuth) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...fetchOptions, headers });

            if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => null);
                throw new ApiError(retryResponse.status, retryResponse.statusText, errorData);
            }

            return retryResponse.json();
        }

        // Redirect to login if refresh failed
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, errorData);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
}

// Convenience methods
export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
