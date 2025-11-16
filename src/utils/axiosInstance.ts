import axios, { type AxiosInstance } from "axios";

export interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export function createApiClient(config?: ApiClientConfig): AxiosInstance {
    const instance = axios.create({
        baseURL: config?.baseURL || process.env.NEXT_PUBLIC_API_URL || "/api",
        timeout: config?.timeout || 30000,
        headers: {
            "Content-Type": "application/json",
            ...config?.headers,
        },
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            // Vous pouvez ajouter des tokens, logs, etc.
            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // Gestion centralisée des erreurs
            if (error.response?.status === 401) {
                // Redirection ou refresh token
            }
            return Promise.reject(error);
        },
    );

    return instance;
}
