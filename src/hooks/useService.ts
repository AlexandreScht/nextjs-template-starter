import {
    useQuery,
    type QueryKey,
    type UseQueryOptions,
    type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import { useContext } from "react";
import { ServiceContext } from "./providers/services";

type Services = ReturnType<typeof useBaseService>;
type Selector<T> = (services: Services) => T;
type AsyncSelector<TResult, TConfig = AxiosRequestConfig | undefined> = (
    services: Services,
    requestConfig?: TConfig,
) => Promise<TResult> | TResult;

type UseServiceQueryOptions<TResult, TConfig> = {
    queryKey?: QueryKey;
    requestConfig?: TConfig;
} & Omit<UseQueryOptions<TResult>, "queryKey" | "queryFn">;

function useBaseService() {
    const callServices = useContext(ServiceContext);
    if (!callServices) {
        throw new Error("useService must be used within a ServicesProvider");
    }

    return callServices.services;
}

export function useServiceInstance<T>(selector: Selector<T>): T {
    const services = useBaseService();
    return selector(services);
}

export function useService<TResult, TConfig = AxiosRequestConfig | undefined>(
    selector: AsyncSelector<TResult, TConfig>,
    options?: UseServiceQueryOptions<TResult, TConfig>,
): UseQueryResult<TResult> {
    const services = useBaseService();

    const queryKey = options?.queryKey ?? [
        "service",
        selector.name || "anonymous",
    ];

    return useQuery({
        ...options,
        queryKey,
        queryFn: async () => selector(services, options?.requestConfig),
    });
}
