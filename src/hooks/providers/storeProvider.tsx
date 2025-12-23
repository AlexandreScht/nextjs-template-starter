"use client";
import { ClientException } from "@/exceptions/errors";
import prepareStore, { type AppStore } from "@/stores";
import { createContext, type ReactNode, useContext, useState } from "react";
import { type StoreApi, useStore as useZustandStore } from "zustand";

const StoreContext = createContext<StoreApi<AppStore> | null>(null);

interface StoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AppStore>;
}

export function StoreProvider({
  children,
  initialState = {},
}: StoreProviderProps) {
  const [store] = useState(() => prepareStore(initialState));

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore<T>(selector: (state: AppStore) => T): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new ClientException(
      404,
      "useStore must be used within a <StoreProvider>",
    );
  }
  return useZustandStore(store, selector);
}
