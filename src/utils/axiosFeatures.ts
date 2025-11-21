import { AxiosHeaders } from "axios";
import { isBrowser } from "./commun";
import type { AxiosRequestConfigWithMeta } from "@/interfaces/axiosInstanceTypes";


export function ensureHeaders(headers?: AxiosRequestConfigWithMeta["headers"]) {
    if (headers instanceof AxiosHeaders) {
        return headers;
    }
    return AxiosHeaders.from(headers ?? {});
}

export function attachContextHeaders(config: AxiosRequestConfigWithMeta) {
    if (!isBrowser()) return;
    config.headers = ensureHeaders(config.headers);
    const locale = navigator.language || "en";
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "web";
    config.headers["X-App-Locale"] = locale;
    config.headers["X-App-Version"] = appVersion;
}


export function beginRequestTracking(
    config: AxiosRequestConfigWithMeta,
    pendingRequestCount: number,
): number {
    if (!isBrowser()) return pendingRequestCount;
    if (!config.metadata) {
        config.metadata = {};
    }
    if (typeof performance !== "undefined") {
        config.metadata.startTime = performance.now();
    }
    const nextCount = pendingRequestCount + 1;
    if (nextCount === 1) {
        window.dispatchEvent(new CustomEvent("axios:loading-start"));
    }
    return nextCount;
}

export function finalizeRequestTracking(
    pendingRequestCount: number,
    config?: AxiosRequestConfigWithMeta,
): number {
    if (!isBrowser()) return pendingRequestCount;
    if (config?.metadata?.startTime && typeof performance !== "undefined") {
        const duration = performance.now() - config.metadata.startTime;
        const label = config?.url
            ? `${config.method ? `[${config.method.toUpperCase()}] ` : ""}${config.url}`
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

export function notifyClient(message: string, type: "error" | "success" = "error") {
    if (!isBrowser()) return;
    window.dispatchEvent(
        new CustomEvent("axios:notification", {
            detail: { message, type },
        }),
    );
}