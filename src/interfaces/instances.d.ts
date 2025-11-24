import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export type RequestProps = {
    data?: InternalAxiosRequestConfig["data"];
    params?: InternalAxiosRequestConfig["params"];
    [key: string]: unknown;
};

export interface AxiosRequestConfigWithMeta extends InternalAxiosRequestConfig {
    metadata?: {
        startTime?: number;
    };
    _retry?: boolean;
    requestProps?: RequestProps;
}

export type ApiClientConfig = Omit<
    AxiosRequestConfig,
    "method" | "data" | "params"
>;
