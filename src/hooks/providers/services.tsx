"use client";

import { serviceCache } from "@/config/serviceCache";
import { createServices, type Services } from "@/services";
import { createApiClient, type ApiClientConfig } from "@/utils/axiosInstance";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { createContext, useMemo, useState, type ReactNode } from "react";

interface ServiceContextValue {
  apiClient: AxiosInstance;
  services: Services;
}

export const ServiceContext = createContext<ServiceContextValue | undefined>(
  undefined,
);

interface ServicesProviderProps {
  children: ReactNode;
  apiConfig?: ApiClientConfig;
}

export function ServicesProvider({
  children,
  apiConfig,
}: ServicesProviderProps) {
  const [queryClient] = useState(() => new QueryClient(serviceCache.client));

  const apiClient = useMemo(() => createApiClient(apiConfig), [apiConfig]);
  const services = useMemo(() => createServices(apiClient), [apiClient]);

  const value = useMemo(
    () => ({
      apiClient,
      services,
    }),
    [apiClient, services],
  );

  return (
    <ServiceContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ServiceContext.Provider>
  );
}
