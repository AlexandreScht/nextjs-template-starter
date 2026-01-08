"use client";

import { Services } from "@/services";
import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import QueryProvider from "./QueryProvider";
import {
  type ServiceContextValue,
  type ServiceEventState,
  type ServiceNotification,
} from "@/types/service";

export const ServiceContext = createContext<ServiceContextValue | undefined>(
  undefined,
);

export const ServiceEventContext = createContext<ServiceEventState | undefined>(
  undefined,
);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastDuration, setLastDuration] =
    useState<ServiceEventState["lastDuration"]>(null);
  const [lastNotification, setLastNotification] =
    useState<ServiceNotification | null>(null);

  const value = useMemo(
    () => ({
      services: new Services({ cache: "no-store" } as const),
    }),
    [],
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

    window.addEventListener("service:loading-start", handleLoadingStart);
    window.addEventListener("service:loading-stop", handleLoadingStop);
    window.addEventListener(
      "service:request-duration",
      handleDuration as EventListener,
    );
    window.addEventListener(
      "service:notification",
      handleNotification as EventListener,
    );

    return () => {
      window.removeEventListener("service:loading-start", handleLoadingStart);
      window.removeEventListener("service:loading-stop", handleLoadingStop);
      window.removeEventListener(
        "service:request-duration",
        handleDuration as EventListener,
      );
      window.removeEventListener(
        "service:notification",
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
