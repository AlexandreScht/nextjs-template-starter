import env from "@/config";
import { serviceConfig } from "@/config/services";
import type {
    ApiClient,
    ApiRequestConfig,
    ApiResponse,
    FetchRequestOptions,
} from "@/interfaces/apiClient";
import { AxiosHeaders } from "axios";
import { cookies } from "next/headers";

export function createFetchInstance(
    defaultConfig: FetchRequestOptions = {},
): ApiClient {
    async function request<TResponse = unknown, TBody = unknown>(
        config: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>> {
        const fetchConfig = config as FetchRequestOptions;

        const mergedConfig = { ...defaultConfig, ...fetchConfig };
        const {
            baseURL,
            url: configUrl,
            params,
            data,
            method,
            headers: configHeaders,
            mode: overrideMode,
            referrerPolicy: overrideReferrer,
            ...restFetchOptions
        } = mergedConfig as any;

        const finalBaseURL = baseURL || env.API_URI;

        const resolvedUrl = resolveUrl(finalBaseURL, configUrl || "");
        const finalUrl = applyParamsToUrl(resolvedUrl, params);

        let automaticMode: RequestMode = "same-origin";
        const targetOrigin = getUrlOrigin(finalUrl);
        const appOrigin = getUrlOrigin(finalBaseURL);

        const isInternal = !targetOrigin || targetOrigin === appOrigin;
        const isAllowedExternal =
            targetOrigin &&
            serviceConfig.server.allowedCorsOrigins.includes(targetOrigin);

        if (isInternal) {
            automaticMode = "same-origin";
        } else if (isAllowedExternal) {
            automaticMode = "cors";
        } else {
            automaticMode = "same-origin";
            if (process.env.NODE_ENV === "development") {
                console.warn(
                    `[FetchInstance] Appel bloqué vers origine non autorisée : ${targetOrigin}`,
                );
            }
        }

        const headers = new Headers(defaultConfig.headers);

        try {
            const cookieStore = await cookies();
            const allCookies = cookieStore.toString();
            if (allCookies) {
                headers.set("Cookie", allCookies);
            }
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.warn(
                    "[FetchInstance] Impossible d'injecter les cookies (contexte statique ou hors requête). La requête continue sans auth.",
                    error instanceof Error ? error.message : error,
                );
            }
        }

        if (configHeaders) {
            if (typeof configHeaders.forEach === "function") {
                configHeaders.forEach((v: string, k: string) =>
                    headers.set(k, v),
                );
            } else {
                Object.entries(configHeaders).forEach(([k, v]) => {
                    if (v) headers.set(k, String(v));
                });
            }
        }

        const payload = data ?? (fetchConfig as any).body;
        const serializedBody = serializeBody(payload);
        if (
            serializedBody &&
            !headers.has("Content-Type") &&
            typeof serializedBody === "string"
        ) {
            try {
                JSON.parse(serializedBody);
                headers.set("Content-Type", "application/json");
            } catch {}
        }

        const init: RequestInit & { next?: any } = {
            ...restFetchOptions,
            method: method || "GET",
            headers,
            body: serializedBody,
            mode: overrideMode ?? automaticMode,
            referrerPolicy:
                overrideReferrer ?? serviceConfig.server.referrerPolicy,
        };

        const response = await fetch(finalUrl, init);

        if (!response.ok) {
            throw await buildFetchError(response, mergedConfig);
        }

        const responseData = await parseResponseData(response);

        return {
            data: responseData as TResponse,
            status: response.status,
            statusText: response.statusText,
            headers: AxiosHeaders.from(Object.fromEntries(response.headers)),
            config: mergedConfig as any,
            request: {},
        };
    }

    return {
        request,
        get: (url, config) => request({ ...config, url, method: "GET" }),
        delete: (url, config) => request({ ...config, url, method: "DELETE" }),
        post: (url, data, config) =>
            request({ ...config, url, data, method: "POST" }),
        put: (url, data, config) =>
            request({ ...config, url, data, method: "PUT" }),
        patch: (url, data, config) =>
            request({ ...config, url, data, method: "PATCH" }),
    };
}

function getUrlOrigin(url: string): string | null {
    try {
        const urlObj = new URL(url, "http://dummy-base");
        if (urlObj.origin === "http://dummy-base") return null;
        return urlObj.origin;
    } catch {
        return null;
    }
}

function resolveUrl(baseURL: string, url: string): string {
    if (!baseURL || /^https?:\/\//i.test(url)) return url;
    const cleanBase = baseURL.replace(/\/+$/, "");
    const cleanUrl = url.replace(/^\/+/, "");
    return cleanUrl ? `${cleanBase}/${cleanUrl}` : cleanBase;
}

function applyParamsToUrl(url: string, params?: any) {
    if (!params) return url;
    const urlObj = new URL(url, "http://dummy-base");
    const isRelative = !/^https?:\/\//i.test(url);
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
            value.forEach((v) => urlObj.searchParams.append(key, String(v)));
        } else {
            urlObj.searchParams.set(key, String(value));
        }
    });
    return isRelative
        ? urlObj.pathname + urlObj.search + urlObj.hash
        : urlObj.toString();
}

function serializeBody(data: any): BodyInit | undefined {
    if (data === undefined || data === null) return undefined;
    if (
        typeof data === "string" ||
        data instanceof FormData ||
        data instanceof URLSearchParams ||
        data instanceof Blob
    ) {
        return data;
    }
    return JSON.stringify(data);
}

async function parseResponseData(response: Response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }
    return response.text();
}

async function buildFetchError(response: Response, config?: any) {
    let errorData: any;
    try {
        errorData = await parseResponseData(response);
    } catch {
        errorData = null;
    }
    const error = new Error(
        errorData?.message || response.statusText || "Fetch error",
    );
    (error as any).status = response.status;
    (error as any).response = {
        data: errorData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
    };
    return error;
}
