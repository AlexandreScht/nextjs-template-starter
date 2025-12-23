import { createStore, type StateCreator, type StoreApi } from "zustand";
import {
    createJSONStorage,
    persist,
    subscribeWithSelector,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createExampleSlice from "./example";
import createTodoSlice from "./todos";

const slices = [createExampleSlice, createTodoSlice] as const;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

type ExtractState<T> =
    T extends StateCreator<infer S, any, any, any> ? S : never;

export type AppStore = UnionToIntersection<
    ExtractState<(typeof slices)[number]>
>;

const storage =
    typeof window !== "undefined"
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
          }));

export default function prepareStore(
    initialState: Partial<AppStore> = {},
): StoreApi<AppStore> {
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
                name: "app-store",
                storage,
                partialize: (state) => state,
            },
        ),
    );
}
