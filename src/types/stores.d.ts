import { type slices } from "@/stores";
import { type ReactNode } from "react";
import { type StateCreator } from "zustand";

export interface StoreProviderProps {
    children: ReactNode;
    initialState?: Partial<AppStore>;
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

export type AppStore = UnionToIntersection<ReturnType<(typeof slices)[number]>>;

export type SliceStore<T> = StateCreator<T, [["zustand/immer", never]], [], T>;
