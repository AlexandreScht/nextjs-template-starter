import { type createServices } from "@/services";
import { type clientOptions } from "./service";
import type { NextFetchRequestConfig } from "./serviceContext";
import { type UseQueryOptions } from "@tanstack/react-query";
export type ServiceResponse<T> = {
    data: T;
    error: unknown;
    status: number;
    headers?: HeadersInit | Record<string, unknown> | any;
};

// Removed local non-exported Services/PublicServices types that might conflict or be unused,
// keeping the exported Services type below.

export type Services<TOpts = serviceOptions> = ReturnType<
    typeof createServices<TOpts>
>;

interface ServiceContextValue {
    services: Services;
    defaultOptions?: clientOptions;
}

type ServiceNotification = {
    message: string;
    type: "error" | "success";
};

type ServiceEventState = {
    isLoading: boolean;
    lastDuration: { url?: string; duration: number } | null;
    lastNotification: ServiceNotification | null;
};

export interface RequestContext {
    metadata?: {
        startTime?: number;
    };
    headers?: HeadersInit;
    url?: string;
    method?: string;
    [key: string]: any;
}

export interface ResponseInitWithContext extends Response {
    _context?: RequestContext;
}

export interface RequestInitWithContext extends RequestInit {
    _context?: RequestContext;
}

export interface ErrorData {
    message?: string;
    error?: string;
}

type PublicServices = Omit<Services, "with">;
type Selector<TResult> = (
    services: PublicServices,
) => Promise<TResult> | TResult;

// type Selector<TResult> = (
//     services: Services<clientOptions>,
// ) => Promise<TResult> | TResult;

type UseServiceQueryOptions<TResult> = Omit<
    UseQueryOptions<TResult>,
    "queryFn" | "queryKey"
> & {
    /**
     * Clé React Query pour le cache.
     */
    queryKey: UseQueryOptions<TResult>["queryKey"];

    /**
     * Options spécifiques à passer à l'instance de Service (ex: headers, cache, etc.).
     * Ces options seront fusionnées avec les options par défaut du Provider via la méthode `.with()`.
     */
    fetchOptions?: clientOptions;
};

/**
 * Options de configuration pour les appels serveur (SSR), dérivé de `RequestInit`.
 * Certaines clés comme `body`, `method`, `window`, etc. sont exclues car gérées automatiquement ou non pertinentes.
 */
export type serverOptions = Omit<
    RequestInit,
    "body" | "method" | "window" | "mode" | "credentials"
> & {
    /**
     * Permet d'annuler une requête en cours (Abort).
     *
     * @example
     * // Annuler après 5 secondes (Timeout)
     * const controller = new AbortController();
     * setTimeout(() => controller.abort(), 5000);
     *
     * callService(..., { signal: controller.signal });
     */
    signal?: AbortSignal | null;

    /**
     * Contrôle le comportement du cache HTTP standard du navigateur (ou du serveur fetch).
     *
     * - `'default'`: Comportement standard (vérifie si frais, sinon revalide).
     * - `'no-store'`: Ne jamais mettre en cache, toujours télécharger (ex: données temps réel).
     * - `'force-cache'`: Utiliser le cache même s'il est périmé (fallback offline).
     * - `'reload'`: Ignorer le cache local et forcer le téléchargement réseau.
     *
     * @example
     * // Toujours récupérer la version la plus fraîche
     * callService(..., { cache: 'no-store' });
     */
    cache?: RequestCache;

    /**
     * (SRI - Subresource Integrity) Empreinte de sécurité pour valider le fichier reçu.
     * Si le hash du fichier téléchargé ne correspond pas, la requête échoue.
     * Surtout utilisé pour les scripts/styles via CDN, rare pour des appels API JSON.
     *
     * @example
     * integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC'
     */
    integrity?: string;

    /**
     * Maintient la requête vivante même si l'onglet est fermé ou que l'utilisateur navigue ailleurs.
     * Idéal pour les "beacons" d'analytique ou sauvegardes de dernière minute onUnload.
     *
     * @default false
     * @example
     * // Envoyer une stat "Page Quittée" sans être coupé
     * callService(..., { keepalive: true });
     */
    keepalive?: boolean;

    /**
     * Indique l'urgence de la requête au navigateur pour optimiser l'ordre de chargement.
     *
     * - `'high'`: Données critiques pour l'affichage initial (ex: LCP).
     * - `'low'`: Préchargement, données en bas de page, polices non critiques.
     * - `'auto'`: Le navigateur décide.
     *
     * @example
     * callService(..., { priority: 'high' });
     */
    priority?: RequestPriority;

    /**
     * Définit quelle URL est envoyée dans l'entête `Referer` au serveur.
     * Utile pour masquer l'URL d'origine si elle contient des infos sensibles.
     *
     * @example
     * referrer: 'https://mon-site.com' // Masque le path complet
     * referrer: '' // N'envoie aucun referer
     */
    referrer?: string;

    /**
     * Règle générale de confidentialité pour l'envoi du Referrer.
     *
     * - `'no-referrer'`: Ne jamais envoyer.
     * - `'strict-origin-when-cross-origin'` (Défaut): Envoie tout si même site, juste le domaine si site externe HTTPS, rien si vers HTTP.
     * - `'unsafe-url'`: Envoie tout, tout le temps (déconseillé).
     */
    referrerPolicy?: ReferrerPolicy;

    /**
     * Options spécifiques au cache Next.js (App Router).
     *
     * @example
     * // Revalidation ISR (Incremental Static Regeneration)
     * next: {
     *   revalidate: 60, // Mettre en cache pour 60 secondes
     *   tags: ['users'] // Tag pour invalider manuellement via revalidateTag('users')
     * }
     */
    next?: NextFetchRequestConfig;
};
export type clientOptions = Omit<
    RequestInit,
    "body" | "method" | "window" | "mode" | "credentials" | "next" | "cache"
> & {
    /**
     * Permet d'annuler une requête en cours (Abort).
     *
     * @example
     * // Annuler après 5 secondes (Timeout)
     * const controller = new AbortController();
     * setTimeout(() => controller.abort(), 5000);
     *
     * callService(..., { signal: controller.signal });
     */
    signal?: AbortSignal | null;

    /**
     * (SRI - Subresource Integrity) Empreinte de sécurité pour valider le fichier reçu.
     * Si le hash du fichier téléchargé ne correspond pas, la requête échoue.
     * Surtout utilisé pour les scripts/styles via CDN, rare pour des appels API JSON.
     *
     * @example
     * integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC'
     */
    integrity?: string;

    /**
     * Maintient la requête vivante même si l'onglet est fermé ou que l'utilisateur navigue ailleurs.
     * Idéal pour les "beacons" d'analytique ou sauvegardes de dernière minute onUnload.
     *
     * @default false
     * @example
     * // Envoyer une stat "Page Quittée" sans être coupé
     * callService(..., { keepalive: true });
     */
    keepalive?: boolean;

    /**
     * Indique l'urgence de la requête au navigateur pour optimiser l'ordre de chargement.
     *
     * - `'high'`: Données critiques pour l'affichage initial (ex: LCP).
     * - `'low'`: Préchargement, données en bas de page, polices non critiques.
     * - `'auto'`: Le navigateur décide.
     *
     * @example
     * callService(..., { priority: 'high' });
     */
    priority?: RequestPriority;

    /**
     * Définit quelle URL est envoyée dans l'entête `Referer` au serveur.
     * Utile pour masquer l'URL d'origine si elle contient des infos sensibles.
     *
     * @example
     * referrer: 'https://mon-site.com' // Masque le path complet
     * referrer: '' // N'envoie aucun referer
     */
    referrer?: string;

    /**
     * Règle générale de confidentialité pour l'envoi du Referrer.
     *
     * - `'no-referrer'`: Ne jamais envoyer.
     * - `'strict-origin-when-cross-origin'` (Défaut): Envoie tout si même site, juste le domaine si site externe HTTPS, rien si vers HTTP.
     * - `'unsafe-url'`: Envoie tout, tout le temps (déconseillé).
     */
    referrerPolicy?: ReferrerPolicy;
};
export type serviceOptions = clientOptions | serverOptions;
