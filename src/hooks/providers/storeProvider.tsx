"use client";
import { ClientException } from "@/exceptions/errors";
import { type AppStore, type StoreProviderProps } from "@/interfaces/stores";
import prepareStore from "@/stores";
import { createContext, useContext, useState } from "react";
import { type StoreApi, useStore as useZustandStore } from "zustand";

const StoreContext = createContext<{
  local: StoreApi<AppStore>;
  session: StoreApi<AppStore>;
} | null>(null);

export function StoreProvider({
  children,
  initialState = {},
}: StoreProviderProps) {
  const [localStore] = useState(() => prepareStore(initialState, "local"));
  const [sessionStore] = useState(() => prepareStore(initialState, "session"));

  return (
    <StoreContext.Provider value={{ local: localStore, session: sessionStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore<T>(
  selector: (state: AppStore) => T,
  storageType: "local" | "session" = "local",
): T {
  const stores = useContext(StoreContext);
  if (!stores) {
    throw new ClientException(
      404,
      "useStore must be used within a <StoreProvider>",
    );
  }
  const store = stores[storageType];
  return useZustandStore(store, selector);
}
