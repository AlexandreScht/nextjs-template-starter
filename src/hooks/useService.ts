import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContext } from "react";
import { ServiceContext } from "../providers/servicesProvider";
import type {
    Selector,
    Services,
    UseServiceQueryOptions,
} from "@/types/service";

function useBaseService() {
    const callServices = useContext(ServiceContext);
    if (!callServices) {
        throw new Error("useService must be used within a ServicesProvider");
    }

    return callServices.services;
}

export function useServiceInstance<T>(selector: (services: Services) => T): T {
    const services = useBaseService();
    return selector(services);
}

/**
 * Helper to call a service client-side (CSR) with React Query integration.
 * Uses the shared service instance from the provider context.
 *
 * @param selector Function to select the service to call
 * @param options React Query options (queryKey, enabled, initialData, etc)
 * @returns The result of the service call wrapped in a React Query result
 *
 * @example
 * const { data: users, isLoading } = useService(
 *   (services) => services.users.getUsers(),
 *   { enabled: !!userId }
 * );
 */
export function useService<TResult>(
    selector: Selector<TResult>,
    options?: UseServiceQueryOptions<TResult>,
): UseQueryResult<TResult> {
    const services = useBaseService();

    const { fetchOptions, queryKey: key, ...restOptions } = options || {};

    const callingServices = services.with({
        ...fetchOptions,
        cache: "no-store",
    });

    const queryKey = key ?? ["service", selector.name || "anonymous"];

    return useQuery({
        ...restOptions,
        queryKey,
        queryFn: async () => selector(callingServices),
    });
}
