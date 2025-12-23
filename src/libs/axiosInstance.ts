import env from "@/config";
import {
    ExpiredSessionError,
    InvalidArgumentError,
    InvalidRoleAccessError,
} from "@/exceptions";
import type {
    ApiClientConfig,
    AxiosRequestConfigWithMeta,
} from "@/interfaces/instances";
import apiRoutes from "@/router/api";
import {
    attachContextHeaders,
    beginRequestTracking,
    finalizeRequestTracking,
    notifyClient,
} from "@/utils/axiosFeatures";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

const pendingRequestCount = 0;

export function createApiClient(config?: ApiClientConfig): AxiosInstance {
    const {
        baseURL,
        timeout,
        withCredentials,
        validateStatus,
        maxRedirects,
        ...options
    } = config || {};

    const resolvedValidateStatus =
        typeof validateStatus === "function"
            ? validateStatus
            : (status: number) => status >= 200 && status < 300;

    const instance = axios.create({
        baseURL: baseURL || env.NEXT_PUBLIC_API_URL,
        timeout: timeout || 30000,
        withCredentials: true,
        ...(withCredentials !== false
            ? { xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN" }
            : {}),
        maxRedirects: maxRedirects ?? 3,
        validateStatus: resolvedValidateStatus,
        ...options,
    });

    //? Request interceptor
    instance.interceptors.request.use(
        (config) => {
            const typedConfig = config as AxiosRequestConfigWithMeta;
            attachContextHeaders(typedConfig);
            beginRequestTracking(typedConfig, pendingRequestCount);

            typedConfig.requestProps = {
                data: typedConfig.data,
                params: typedConfig.params,
                ...(typedConfig.requestProps ?? {}),
            };
            return typedConfig;
        },
        (error) => {
            prepareAxiosError(error);
            return Promise.reject(error);
        },
    );

    //? Response interceptor
    instance.interceptors.response.use(
        (response) => {
            finalizeRequestTracking(
                pendingRequestCount,
                response.config as AxiosRequestConfigWithMeta,
            );
            const config = response.config as AxiosRequestConfigWithMeta;
            const { data, status, headers, statusText } = response;
            const enrichedResponse = {
                data,
                status,
                headers,
                statusText,
                requestProps: config.requestProps,
            };
            return enrichedResponse as unknown as AxiosResponse;
        },
        async (error) => {
            const originalRequest = error.config as
                | AxiosRequestConfigWithMeta
                | undefined;
            finalizeRequestTracking(pendingRequestCount, originalRequest);

            const status = error.response?.status;

            if (status && status >= 400 && status < 500 && status !== 401) {
                notifyClient(
                    error.response?.data?.message || "Une erreur est survenue",
                    "error",
                );
            }

            if (status === 401 && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    await instance.post(apiRoutes.api.refresh_endpoint());
                    return instance(originalRequest);
                } catch {
                    notifyClient("Session expirée, veuillez vous reconnecter.");
                }
            }

            prepareAxiosError(error);
            return Promise.reject(error);
        },
    );

    return instance;
}

function prepareAxiosError(err: any) {
    const {
        status,
        data: { error },
    } = err?.response || { data: {} };

    switch (status) {
        case 605:
            throw new InvalidRoleAccessError(error || "Access denied");
        case 999:
            if (error === "Session expired") {
                throw new ExpiredSessionError();
            }
            break;
        case 403:
            throw new InvalidRoleAccessError("Insufficient permissions");
        case 429:
            throw new InvalidArgumentError("Too many requests");
        default:
            if (status && status >= 500) {
                throw new InvalidArgumentError("Server error occurred");
            }
    }
}
