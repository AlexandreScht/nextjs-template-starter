"use client";

import { type ApiClientConfig } from "@/interfaces/instances";
import { createApiClient } from "@/libs/axiosInstance";
import { createServices, type Services } from "@/services";
import type { AxiosInstance } from "axios";
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import QueryProvider from "./QueryProvider";

interface ServiceContextValue {
  apiClient: AxiosInstance;
  services: Services;
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

export const ServiceContext = createContext<ServiceContextValue | undefined>(
  undefined,
);

export const ServiceEventContext = createContext<ServiceEventState | undefined>(
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastDuration, setLastDuration] =
    useState<ServiceEventState["lastDuration"]>(null);
  const [lastNotification, setLastNotification] =
    useState<ServiceNotification | null>(null);

  const apiClient = useMemo(() => createApiClient(apiConfig), [apiConfig]);
  const services = useMemo(() => createServices(apiClient), [apiClient]);

  const value = useMemo(
    () => ({
      apiClient,
      services,
    }),
    [apiClient, services],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleLoadingStart = () => setIsLoading(true);
    const handleLoadingStop = () => setIsLoading(false);
    const handleDuration = (event: Event) => {
      const detail = (event as CustomEvent<ServiceEventState["lastDuration"]>)
        .detail;
      if (detail) {
        setLastDuration(detail);
      }
    };
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<ServiceNotification>).detail;
      if (detail) {
        setLastNotification(detail);
      }
    };

    window.addEventListener("axios:loading-start", handleLoadingStart);
    window.addEventListener("axios:loading-stop", handleLoadingStop);
    window.addEventListener(
      "axios:request-duration",
      handleDuration as EventListener,
    );
    window.addEventListener(
      "axios:notification",
      handleNotification as EventListener,
    );

    return () => {
      window.removeEventListener("axios:loading-start", handleLoadingStart);
      window.removeEventListener("axios:loading-stop", handleLoadingStop);
      window.removeEventListener(
        "axios:request-duration",
        handleDuration as EventListener,
      );
      window.removeEventListener(
        "axios:notification",
        handleNotification as EventListener,
      );
    };
  }, []);

  const eventValue = useMemo<ServiceEventState>(
    () => ({
      isLoading,
      lastDuration,
      lastNotification,
    }),
    [isLoading, lastDuration, lastNotification],
  );

  return (
    <ServiceContext.Provider value={value}>
      <ServiceEventContext.Provider value={eventValue}>
        <QueryProvider>{children}</QueryProvider>
      </ServiceEventContext.Provider>
    </ServiceContext.Provider>
  );
}
