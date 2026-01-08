import { createServices } from "@/services";
import type { Selector, serverOptions } from "@/types/service";
import { isServer } from "@tanstack/react-query";

/**
 * Helper to call a service server-side (SSR) with specific configuration.
 * Creates a new service instance for each call to isolate configuration (headers, cache, etc).
 *
 * @param selector Function to select the service to call
 * @param options Request configuration options (headers, cache Next.js, etc)
 * @returns The result of the service call
 *
 * @example
 * const users = await callService(
 *   (services) => services.users.getUsers(),
 *   { next: { revalidate: 60 } }
 * );
 */
export async function callService<TResult>(
    selector: Selector<TResult>,
    options?: serverOptions,
): Promise<{ data: TResult | undefined; error: unknown }> {
    if (!isServer) {
        throw new Error("callService cannot be used on the client");
    }
    const services = createServices<serverOptions>(options);
    try {
        const data = await selector(services);
        return { data, error: null };
    } catch (error) {
        return { data: undefined, error };
    }
}
