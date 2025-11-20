import type { FetchRequestOptions } from "@/interfaces/apiClient";
import { createFetchInstance } from "@/libs/fetchInstance";
import { createServices, type Services } from "@/services";

/**
 * Helper pour appeler un service coté serveur (SSR) avec une configuration spécifique.
 * Crée une nouvelle instance de fetch pour chaque appel afin d'isoler la configuration (headers, cache, etc).
 *
 * @param selector Fonction de sélection du service à appeler
 * @param options Options de configuration de la requête (headers, cache Next.js, etc)
 * @returns Le résultat de l'appel au service
 *
 * @example
 * const users = await callService(
 *   (services) => services.users.getUsers(),
 *   { next: { revalidate: 60 } }
 * );
 */
export async function callService<T>(
    selector: (services: Services) => Promise<T>,
    options?: FetchRequestOptions,
): Promise<T> {
    const apiClient = createFetchInstance(options);
    const services = createServices(apiClient);
    return selector(services);
}
