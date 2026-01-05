import env from "@/config";
import { serviceConfig } from "@/config/services";
import {
    ExpiredSessionError,
    InvalidArgumentError,
    InvalidRoleAccessError,
} from "@/exceptions";
import { type RequestContext } from "@/interfaces/instances";
import apiRoutes from "@/router/api";
import {
    attachContextHeaders,
    beginRequestTracking,
    finalizeRequestTracking,
    notifyClient,
} from "@/utils/axiosFeatures";
import { treaty } from "@elysiajs/eden";
import { isServer } from "@tanstack/react-query";

// Type Placeholder - To be replaced by: import type { App } from "your-backend/src"
type App = any;

const pendingRequestCount = { value: 0 };

/**
 * Custom fetch wrapper to handle Base URL and 401 Refresh Token Loop
 */
const customFetcher = async (
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<Response> => {
    const response = await fetch(input, init);

    //? if user is not authenticated, try to refresh token
    if (response.status === 401) {
        const urlStr = input.toString();
        if (!urlStr.includes(apiRoutes.api.refresh_token())) {
            try {
                await fetch(`${env.API_URI}${apiRoutes.api.refresh_token()}`, {
                    method: "POST",
                    credentials: "include",
                });
                return await fetch(input, init);
            } catch {
                notifyClient("Session expirée, reconnexion requise.");
            }
        }
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
        }
    },

    //* 3. Response Interceptor (Tracking End & Error Notifications)
    onResponse: async (response) => {
        // Tracking End
        // We don't have easy access to the exact 'config' object from onRequest to calculate duration
        // UNLESS Eden attaches it to response? Usually not.
        // For now we stop the loading indicator. Duration tracking might be less accurate or skipped here
        // unless we used 'fetcher' wrapper for it.
        // ACTUALLY: User asked to use onResponse. We will use it for at least finalizeRequestTracking (count decrement).

        if (!isServer) {
            pendingRequestCount.value = finalizeRequestTracking(
                pendingRequestCount.value,
                // We can't pass the original request context here easily to get startTime
                // So duration reporting might be missing, but 'loading-stop' will work.
                undefined,
            );
        }

        // Error Notifications (4xx / 5xx)
        if (!response.ok) {
            const status = response.status;

            // 401 handled in fetcher (for retry), but notification might still occur if retry failed?
            // If retry happened in fetcher and succeeded, response.ok would be true (the retried one).
            // If retry failed, we get 401 again.

            if (status >= 400 && status < 500 && status !== 401 && !isServer) {
                let msg = "Une erreur est survenue";
                try {
                    // Clone because body might be used by caller
                    const errorData = await response.clone().json();
                    msg =
                        errorData.message ||
                        errorData.error ||
                        response.statusText;
                } catch {}
                notifyClient(msg, "error");
            }

            // Throw specific errors so calling code behaves like before
            // Note: This makes treaty call throw instead of returning { data, error }
            await throwSpecificError(response);
        }
    },

    // 4. Custom Fetcher (Retry logic)
    fetcher: customFetcher,
});

export type ServicesInstance = typeof servicesInstance;

/**
 * Error Mapping Helper
 * (Kept independent to be clean)
 */
async function throwSpecificError(response: Response) {
    let errorData: any = {};
    try {
        errorData = await response.clone().json();
    } catch {
        /* ignore */
    }

    const errorMsg =
        errorData.message || errorData.error || response.statusText;
    const status = response.status;

    switch (status) {
        case 605:
            throw new InvalidRoleAccessError(errorMsg || "Access denied");
        case 999:
            // Match logic from axiosInstance: check strict "Session expired" or similar
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
            if (status >= 500) {
                throw new InvalidArgumentError("Server error occurred");
            }
            throw new Error(errorMsg);
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
