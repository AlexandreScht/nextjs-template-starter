import type { RateLimitConfig } from "@/types/rateLimit";

type RequestExecutor<TInput, TResponse, TOpts> = (
    data: TInput,
    options?: TOpts,
) => Promise<TResponse>;
export type ExtractResponseData<T> = T extends { data: infer D } ? D : T;
/**
 * Options de configuration pour le portail client API.
 * Ce wrapper unifie la gestion du Rate Limiting, de la validation et des callbacks.
 */
export interface PortalOptions<
    TInput,
    TResponse extends { data: unknown; error?: unknown },
    TValidated = ExtractResponseData<TResponse>,
    TReturn = TValidated,
    TErrorReturn = never,
    TOpts = unknown,
> {
    /**
     * Fonction de validation des données d'entrée.
     * @returns Les données validées de type TInput.
     * @example () => validate(UserSchema, data)
     */
    requestValidator?: () => TInput;

    /**
     * Configuration du Rate Limiting pour cet appel spécifique.
     * Permet de limiter le nombre d'appels à cette API.
     *
     * - Si non fourni : Utilise la configuration par défaut globale.
     * - Si fourni : Fusionne avec la configuration par défaut.
     *
     * @example { maxRequests: 5, windowMs: 60000 } // 5 requêtes par minute
     */
    rateLimitConfig?: Partial<RateLimitConfig>;

    /**
     * La fonction qui exécute l'appel API réel.
     * C'est ici que vous appelez votre client API (axios, fetch, etc.).
     *
     * @param data Les données d'entrée (potentiellement validées par requestValidator).
     * @param options Les options fusionnées à passer à l'appel.
     * @returns Une Promise contenant la réponse API.
     */
    request: RequestExecutor<TInput, TResponse, TOpts>;

    /**
     * Fonction de validation et transformation de la réponse API.
     * Permet de vérifier que la réponse correspond au schéma attendu et de la transformer si nécessaire.
     *
     * @param data Les données brutes de la réponse API.
     * @returns Les données validées/transformées de type TValidated.
     * @example (data) => validate(UserResponseSchema, data)
     */
    responseValidator?: (data: ExtractResponseData<TResponse>) => TValidated;

    /**
     * Callback appelé en cas de succès de tout le processus.
     *
     * @param data Les données finales validées (TValidated).
     * @returns La valeur de retour finale de la fonction (TReturn).
     */
    onSuccess?: (data: TValidated) => TReturn;

    /**
     * Callback appelé en cas d'erreur à n'importe quelle étape (Rate Limit, Validation, Requête).
     *
     * @param error L'erreur survenue.
     * @returns La valeur de retour en cas d'erreur (TErrorReturn).
     */
    onError?: (error: unknown) => TErrorReturn;
}
