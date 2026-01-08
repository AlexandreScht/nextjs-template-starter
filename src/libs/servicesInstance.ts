import env from "@/config";
import { serviceConfig } from "@/config/services";
import {
    ClientException,
    ExpiredSessionError,
    InvalidArgumentError,
    InvalidRoleAccessError,
} from "@/exceptions";
import {
    type RequestInitWithContext,
    type RequestContext,
    type ResponseInitWithContext,
    type ErrorData,
} from "@/types/service";
import apiRoutes from "@/router/api";
import {
    attachContextHeaders,
    beginRequestTracking,
    finalizeRequestTracking,
    notifyClient,
} from "@/utils/instanceFeatures";
import { treaty } from "@elysiajs/eden";
import { isServer } from "@tanstack/react-query";

import type { App } from "@/server/elysiaApp";

const pendingRequestCount = { value: 0 };

let refreshPromise: Promise<void> | null = null;

/**
 * Fonction dédiée à l'appel de refresh token
 */
const performRefreshToken = async () => {
    try {
        const res = await fetch(
            `${env.API_URI}${apiRoutes.api.refresh_token()}`,
            {
                method: "POST",
                credentials: "include",
            },
        );
        if (!res.ok) throw new Error("Refresh failed");
    } catch (error) {
        notifyClient("Session expirée, reconnexion requise.");
        throw error;
    } finally {
        refreshPromise = null;
    }
};

/**
 * Custom fetch wrapper to handle Base URL and 401 Refresh Token Loop
 */
const customFetcher = async (
    input: RequestInfo | URL,
    init?: RequestInitWithContext,
): Promise<ResponseInitWithContext> => {
    const response = (await fetch(input, init)) as ResponseInitWithContext;

    //? if user is not authenticated, try to refresh token
    if (response.status === 401) {
        const urlStr = input.toString();
        if (!urlStr.includes(apiRoutes.api.refresh_token())) {
            try {
                if (!refreshPromise) {
                    refreshPromise = performRefreshToken();
                }
                await refreshPromise;

                const retryResponse = (await fetch(
                    input,
                    init,
                )) as ResponseInitWithContext;

                if (init?._context) {
                    retryResponse._context = init._context;
                }
                return retryResponse;
            } catch {
                notifyClient("Session expirée, reconnexion requise.");
            }
        }
    }

    //? Attach context to response so onResponse can read it
    if (init?._context) {
        response._context = init._context;
    }

    return response;
};

export const servicesInstance = treaty<App>(env.API_URI, {
    //* 1. Headers Interceptor
    headers: async () => {
        const headers = new Headers();

        if (!isServer) {
            attachContextHeaders(headers);
        } else {
            //? Server-side Cookies
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const allCookies = cookieStore.toString();
                if (allCookies) {
                    headers.set("Cookie", allCookies);
                }
            } catch {
                // Ignore in static/build context
            }
        }

        //? Convert Headers to Record<string, string> for Eden compatibility
        const headersRecord: Record<string, string> = {};
        headers.forEach((value, key) => {
            headersRecord[key] = value;
        });
        return headersRecord;
    },

    //* 2. Request Interceptor (Tracking Start)
    onRequest: async (path, config) => {
        //? Universal Logic (Server + Client) - Origin Security Check
        const urlStr = path.toString();

        const targetOrigin = getUrlOrigin(urlStr);

        const isAllowedExternal =
            targetOrigin &&
            serviceConfig.allowedCorsOrigins.includes(targetOrigin);

        if (!config.mode) {
            config.mode = isAllowedExternal ? "cors" : "same-origin";
        }

        //? Override Headers logic (handled automatically by Eden merge)
        if (!isServer) {
            if (!config.headers) {
                config.headers = new Headers();
            } else if (
                !(config.headers instanceof Headers) &&
                typeof config.headers === "object"
            ) {
                config.headers = new Headers(
                    config.headers as Record<string, string>,
                );
            }

            //? Tracking
            const context: RequestContext = {
                url: urlStr,
                method: config.method,
                headers: config.headers,
                body: config.body,
            };

            pendingRequestCount.value = beginRequestTracking(
                context,
                pendingRequestCount.value,
            );

            (config as RequestInitWithContext)._context = context;
        }
    },

    //* 3. Response Interceptor (Tracking End & Error Notifications)
    onResponse: async (response: ResponseInitWithContext) => {
        if (!isServer) {
            const context = response._context as RequestContext | undefined;
            pendingRequestCount.value = finalizeRequestTracking(
                pendingRequestCount.value,
                context,
            );
        }

        if (!response.ok) {
            const { status } = response;

            let errorData: ErrorData = {};
            try {
                errorData = (await response.clone().json()) as ErrorData;
            } catch {}

            if (status >= 400 && status < 500 && status !== 401 && !isServer) {
                let msg = "Une erreur est survenue";
                try {
                    msg =
                        errorData?.message ||
                        errorData?.error ||
                        "Une erreur est survenue";
                } catch {}
                notifyClient(msg, "error");
            }

            await throwSpecificError(response, errorData);
        }
    },

    //* 4. Custom Fetcher (Retry logic)
    fetcher: customFetcher,
});

export type ServicesInstance = typeof servicesInstance;

/**
 * Error Mapping Helper
 * (Kept independent to be clean)
 */
async function throwSpecificError(response: Response, errorData: ErrorData) {
    const errorMsg =
        errorData.message || errorData.error || response.statusText;
    const status = response.status;

    switch (status) {
        case 605:
            throw new InvalidRoleAccessError(errorMsg || "Access denied");
        case 401:
            if (
                errorMsg === "Session expired" ||
                errorMsg.includes("expired")
            ) {
                throw new ExpiredSessionError();
            }
            break;
        case 403:
            throw new InvalidRoleAccessError("Insufficient permissions");
        case 429:
            throw new InvalidArgumentError("Too many requests");
        default:
            throw new ClientException(
                status,
                typeof errorMsg === "string"
                    ? errorMsg
                    : JSON.stringify(errorMsg),
            );
    }
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
