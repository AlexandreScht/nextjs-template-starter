import { type AppStore } from "@/interfaces/stores";
import { createStore, type StoreApi } from "zustand";
import {
    createJSONStorage,
    persist,
    subscribeWithSelector,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createExampleSlice from "./example";
import createTodoSlice from "./todos";

export const slices = [createExampleSlice, createTodoSlice] as const;

const getStorage = (type: "local" | "session") => {
    if (typeof window === "undefined") {
        return createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
        }));
    }
    return createJSONStorage(() =>
        type === "session" ? sessionStorage : localStorage,
    );
};

export default function prepareStore(
    initialState: Partial<AppStore> = {},
    storageType: "local" | "session" = "local",
): StoreApi<AppStore> {
    const storage = getStorage(storageType);
    const storeName =
        storageType === "session" ? "app-store-session" : "app-store";

    return createStore<AppStore>()(
        persist(
            subscribeWithSelector(
                immer((...a) => {
                    const combinedSlices = slices.reduce(
                        (acc, slice) => ({ ...acc, ...slice(...a) }),
                        {} as AppStore,
                    );

                    return {
                        ...initialState,
                        ...combinedSlices,
                    };
                }),
            ),
            {
                name: storeName,
                storage,
                partialize: (state: AppStore) => state,
                merge: (persistedState: unknown, currentState: AppStore) => {
                    return deepMerge(currentState, persistedState);
                },
            },
        ),
    );
}

function deepMerge(target: any, source: any): any {
    if (
        typeof target !== "object" ||
        target === null ||
        typeof source !== "object" ||
        source === null
    ) {
        return source;
    }

    if (Array.isArray(source)) {
        return source;
    }

    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
}
