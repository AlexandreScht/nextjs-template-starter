import env from "@/config";
import { securityConfig } from "@/config/services";
import type {
    ApiClient,
    ApiRequestConfig,
    ApiResponse,
    FetchRequestOptions,
} from "@/interfaces/apiClient";
import { AxiosHeaders } from "axios";

// ----------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------

export function createFetchInstance(
    defaultConfig: FetchRequestOptions = {},
): ApiClient {
    async function request<TResponse = unknown, TBody = unknown>(
        config: ApiRequestConfig<TBody>,
    ): Promise<ApiResponse<TResponse, TBody>> {
        // Cast pour l'environnement SSR/Fetch
        const fetchConfig = config as FetchRequestOptions;

        // 1. Fusion de la configuration
        const mergedConfig = { ...defaultConfig, ...fetchConfig };
        const {
            baseURL,
            url: configUrl,
            params,
            data,
            method,
            headers: configHeaders,
            // On exclut mode et referrerPolicy ici pour les gérer manuellement plus bas
            mode: overrideMode,
            referrerPolicy: overrideReferrer,
            ...restFetchOptions
        } = mergedConfig as any;

        // 2. Construction de l'URL
        const finalBaseURL = baseURL || env.NEXT_PUBLIC_API_URL || "/api";

        const resolvedUrl = resolveUrl(finalBaseURL, configUrl || "");
        const finalUrl = applyParamsToUrl(resolvedUrl, params);

        // ---------------------------------------------------------
        // NOUVEAU : Logique de Sécurité Automatique
        // ---------------------------------------------------------

        // Détermination du Mode (CORS / Same-Origin)
        let automaticMode: RequestMode = "same-origin";
        const targetOrigin = getUrlOrigin(finalUrl);
        const appOrigin = getUrlOrigin(finalBaseURL);

        const isInternal = !targetOrigin || targetOrigin === appOrigin;
        const isAllowedExternal =
            targetOrigin &&
            securityConfig.allowedCorsOrigins.includes(targetOrigin);

        if (isInternal) {
            automaticMode = "same-origin"; // Sécurité maximale pour l'interne
        } else if (isAllowedExternal) {
            automaticMode = "cors"; // Autorisé explicitement
        } else {
            // Si c'est externe et non autorisé, on laisse 'same-origin'
            // Ce qui fera échouer le fetch (ce qu'on veut pour bloquer les fuites)
            automaticMode = "same-origin";
            console.warn(
                `[FetchInstance] Appel bloqué vers origine non autorisée : ${targetOrigin}`,
            );
        }

        // 3. Gestion des Headers
        const headers = new Headers(defaultConfig.headers);
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

        // Gestion automatique du Content-Type (JSON)
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
            } catch {
                // Ignore
            }
        }

        // 4. Construction de l'init pour fetch
        const init: RequestInit & { next?: any } = {
            ...restFetchOptions,
            method: method || "GET",
            headers,
            body: serializedBody,
            // Application des sécurités (sauf si surchargé explicitement dans l'appel)
            mode: overrideMode ?? automaticMode,
            referrerPolicy: overrideReferrer ?? securityConfig.referrerPolicy,
        };

        // 5. Exécution du Fetch
        const response = await fetch(finalUrl, init);

        // 6. Gestion des erreurs
        if (!response.ok) {
            throw await buildFetchError(response, mergedConfig);
        }

        // 7. Parsing
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

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function getUrlOrigin(url: string): string | null {
    try {
        // Si l'url est relative (ex: "/api/users"), new URL() throw sauf si on met une base
        // On utilise une base dummy juste pour parser
        const urlObj = new URL(url, "http://dummy-base");
        // Si c'était relatif, l'origine sera "http://dummy-base", on considère ça comme null (interne)
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
