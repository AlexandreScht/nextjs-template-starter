import env from "@/config";
import { isServer } from "@tanstack/react-query";

/**
 * Ensures headers are a standard Headers object
 */
export function ensureHeaders(headers?: HeadersInit | any): Headers {
    if (headers instanceof Headers) {
        return headers;
    }
    // Handle AxiosHeaders or generic objects
    if (typeof headers === "object" && headers !== null) {
        return new Headers(headers as Record<string, string>);
    }
    return new Headers(headers);
}

/**
 * Attaches context headers (Locale, Version) to standard Headers object
 */
export function attachContextHeaders(headers: Headers) {
    if (isServer) return;

    const locale = navigator.language || "en";
    const appVersion = env.APP_VERSION;

    headers.set("X-App-Locale", locale);
    headers.set("X-App-Version", appVersion);
}

/**
 * Starts request tracking
 * @param context Any object that can hold metadata (like axios config or a custom context)
 * @param pendingRequestCount Current pending count
 * @returns New pending count
 */
export function beginRequestTracking(
    context: RequestContext,
    pendingRequestCount: number,
): number {
    if (isServer) return pendingRequestCount;

    if (!context.metadata) {
        context.metadata = {};
    }

    if (typeof performance !== "undefined") {
        context.metadata.startTime = performance.now();
    }

    const nextCount = pendingRequestCount + 1;
    if (nextCount === 1) {
        window.dispatchEvent(new CustomEvent("axios:loading-start"));
    }
    return nextCount;
}

/**
 * Finalizes request tracking
 * @param pendingRequestCount Current pending count
 * @param context Context containing metadata (start time)
 * @returns New pending count
 */
export function finalizeRequestTracking(
    pendingRequestCount: number,
    context?: RequestContext,
): number {
    if (isServer) return pendingRequestCount;

    if (
        env.NODE_ENV === "development" &&
        context?.metadata?.startTime &&
        typeof performance !== "undefined"
    ) {
        const duration = performance.now() - context.metadata.startTime;
        const label = context.url
            ? `${context.method ? `[${context.method.toUpperCase()}] ` : ""}${context.url}`
            : "request";

        window.dispatchEvent(
            new CustomEvent("axios:request-duration", {
                detail: { url: label, duration },
            }),
        );
    }

    const nextCount = pendingRequestCount > 0 ? pendingRequestCount - 1 : 0;
    if (nextCount === 0) {
        window.dispatchEvent(new CustomEvent("axios:loading-stop"));
    }
    return nextCount;
}

export function notifyClient(
    message: string,
    type: "error" | "success" = "error",
) {
    if (isServer) return;
    window.dispatchEvent(
        new CustomEvent("axios:notification", {
            detail: { message, type },
        }),
    );
}
