"use client";
import { type AppStore, type StoreProviderProps } from "@/types/stores";
import prepareStore from "@/stores";
import { createContext, useState } from "react";
import { type StoreApi } from "zustand";

export const StoreContext = createContext<{
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
