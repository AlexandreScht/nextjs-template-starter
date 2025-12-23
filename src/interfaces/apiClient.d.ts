import type { AxiosRequestConfig, AxiosResponse } from "axios";
// --- Configuration Fetch (Server Side) ---
type fetchOptions = Omit<
    RequestInit,
    "method" | "body" | "referrer" | "referrerPolicy" | "window" | "integrity"
>;
export type NextFetchRequestConfig = {
    revalidate?: number | false;
    tags?: string[];
};
export type NextFetchRequestConfigLike = {
    revalidate?: number | false;
    tags?: string[];
};

export type FetchRequestOptions = fetchOptions & {
    next?: NextFetchRequestConfig;
    params?: Record<string, any>;
    baseURL?: string;
};
// --- Configuration Union (Client | Server) ---

// C'est ici que se fait la séparation
export type ApiRequestConfig<TBody = unknown> =
    | AxiosRequestConfig<TBody>
    | FetchRequestOptions;

export type ApiResponse<TData = unknown, TBody = unknown> = AxiosResponse<
    TData,
    TBody
>;

// --- Interface du Client ---

export interface ApiClient {
    request<TResponse = unknown, TBody = unknown>(
        config: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;

    get<TResponse = unknown, TBody = unknown>(
        url: string,
        config?: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;

    delete<TResponse = unknown, TBody = unknown>(
        url: string,
        config?: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;

    post<TResponse = unknown, TBody = unknown>(
        url: string,
        data?: TBody,
        config?: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;

    put<TResponse = unknown, TBody = unknown>(
        url: string,
        data?: TBody,
        config?: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;

    patch<TResponse = unknown, TBody = unknown>(
        url: string,
        data?: TBody,
        config?: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>>;
}
