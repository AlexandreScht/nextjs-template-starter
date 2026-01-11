import { ClientException } from "@/exceptions";
import { StoreContext } from "@/providers/storeProvider";
import { type AppStore } from "@/types/stores";
import { useContext } from "react";
import { useStore as useZustandStore } from "zustand";

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
