import { createRateLimiter, defaultRateLimiter } from "@/middlewares/rateLimit";

import type {
    ExtractResponseData,
    PortalOptions,
} from "@/types/apiClientPortal";

/**
 * Classe de base pour les services API.
 * Gère l'injection automatique des options par défaut et le cycle de vie des requêtes.
 */
export class ApiClientPortal<TOpts = unknown> {
    constructor(protected defaultOptions?: TOpts) {}

    /**
     * Méthode protégée pour effectuer des appels API via le portail.
     * Fusionne automatiquement les options par défaut avec celles de l'appel.
     */
    protected async apiClientPortal<
        TInput = void,
        TResponse extends { data: unknown; error?: unknown } = {
            data: unknown;
            error?: unknown;
        },
        TValidated = ExtractResponseData<TResponse>,
        TReturn = TValidated,
        TErrorReturn = never,
    >(
        options: PortalOptions<
            TInput,
            TResponse,
            TValidated,
            TReturn,
            TErrorReturn,
            TOpts
        >,
    ): Promise<TReturn | TErrorReturn> {
        try {
            const limiter = options.rateLimitConfig
                ? createRateLimiter(options.rateLimitConfig)
                : defaultRateLimiter;

            await limiter.consume();

            let requestPayload: TInput;

            if (options.requestValidator) {
                requestPayload = options.requestValidator();
            } else {
                requestPayload = undefined as TInput;
            }

            const response = await options.request(
                requestPayload,
                this.defaultOptions,
            );
            let responseData = response.data;

            if (options.responseValidator) {
                responseData = options.responseValidator(
                    response.data as ExtractResponseData<TResponse>,
                );
            }

            if (options.onSuccess) {
                return options.onSuccess(responseData as TValidated);
            }

            return responseData as TReturn;
        } catch (error) {
            if (options.onError) {
                return options.onError(error) as TErrorReturn;
            }
            throw error;
        }
    }
}
