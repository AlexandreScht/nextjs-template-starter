import { ApiResponse } from "@/interfaces/apiClient";

type RequestExecutor<TInput, TResponse> = (data: TInput) => Promise<ApiResponse<TResponse>>;

interface PortalOptions<TInput, TResponse, TReturn> {
    // Validation d'entrée (Optionnelle)
    payload?: TInput;
    inputValidator?: (data: unknown) => TInput;

    // Exécution de la requête (Promise directe ou Fonction qui reçoit le payload validé)
    request: Promise<ApiResponse<TResponse>> | RequestExecutor<TInput, TResponse>;

    // Validation de sortie (Optionnelle)
    responseValidator?: (data: unknown) => TResponse;

    // Callbacks
    onSuccess?: (data: TResponse) => TReturn;
    onError?: (error: unknown) => TReturn;
}

/**
 * Wrapper unifié pour les appels API.
 * Gère le cycle complet : Validation Input -> Requête -> Validation Output -> Succès/Erreur.
 */
export async function apiClientPortal<TInput = any, TResponse = any, TReturn = TResponse>(
    options: PortalOptions<TInput, TResponse, TReturn>
): Promise<TReturn> {
    try {
        let requestPayload = options.payload;

        // Étape 1 : Validation de l'Input (si nécessaire)
        if (options.inputValidator && requestPayload !== undefined) {
            requestPayload = options.inputValidator(requestPayload);
        }

        // Étape 2 : Exécution de la requête
        let response: ApiResponse<TResponse>;
        
        if (typeof options.request === "function") {
            // Cas où request est une fonction : on lui passe le payload validé
            response = await options.request(requestPayload as TInput);
        } else {
            // Cas où request est déjà une Promise
            response = await options.request;
        }

        let responseData = response.data;

        // Étape 3 : Validation / Transformation de la réponse
        if (options.responseValidator) {
            responseData = options.responseValidator(responseData);
        }

        // Étape 4 : Callback succès
        if (options.onSuccess) {
            return options.onSuccess(responseData);
        }

        return responseData as unknown as TReturn;
    } catch (error) {
        // Étape 5 : Gestion d'erreur
        if (options.onError) {
            return options.onError(error);
        }
        throw error;
    }
}
