import { type slices } from "@/stores";
import { type ReactNode } from "react";
import { type StoreApi } from "zustand";

interface StoreProviderProps {
    children: ReactNode;
    initialState?: Partial<AppStore>;
}

export type SetStoreState<T> = (
    partial: T | Partial<T> | ((state: T) => T | Partial<T> | void),
    replace?: boolean | undefined,
) => void;

export type GetStoreState<T> = () => T;

export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

export type AppStore = UnionToIntersection<ReturnType<(typeof slices)[number]>>;

export type SliceStore<T> = (
    set: SetStoreState<T>,
    get: GetStoreState<T>,
    store: StoreApi<T>,
) => T;
