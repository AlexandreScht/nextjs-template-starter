import { createRateLimiter, defaultRateLimiter } from "@/middlewares/rateLimit";

import type { PortalOptions } from "@/interfaces/apiClientPortal";

/**
 * Wrapper unifié pour les appels API.
 * Gère le cycle complet : Rate Limit -> Validation Input -> Requête -> Validation Output -> Succès/Erreur.
 */
export async function apiClientPortal<
    TInput = void,
    TResponse = any,
    TValidated = TResponse,
    TReturn = TValidated,
>(
    options: PortalOptions<TInput, TResponse, TValidated, TReturn>,
): Promise<TReturn> {
    try {
        // Étape 0 : Rate Limiting
        const limiter = options.rateLimitConfig
            ? createRateLimiter(options.rateLimitConfig)
            : defaultRateLimiter;

        await limiter.consume();

        let requestPayload: TInput;

        // Étape 1 : Validation de l'Input (si nécessaire)
        if (options.requestValidator) {
            requestPayload = options.requestValidator();
        } else {
            requestPayload = undefined as unknown as TInput;
        }

        // Étape 2 : Exécution de la requête
        const response = await options.request(requestPayload);
        let responseData: unknown = response.data;

        // Étape 3 : Validation / Transformation de la réponse
        if (options.responseValidator) {
            responseData = options.responseValidator(response.data);
        }

        // Étape 4 : Callback succès
        if (options.onSuccess) {
            return options.onSuccess(responseData as TValidated);
        }

        return responseData as TReturn;
    } catch (error) {
        // Étape 5 : Gestion d'erreur
        if (options.onError) {
            return options.onError(error);
        }
        throw error;
    }
}
