"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { type ReactNode } from "react";
import QueryProvider from "./QueryProvider";

interface ServiceBridgeProviderProps {
  children: ReactNode;
  state?: DehydratedState;
}

export default function ServiceBridgeProvider({
  children,
  state,
}: ServiceBridgeProviderProps) {
  return (
    <QueryProvider>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryProvider>
  );
}
