import { type ExampleState } from "@/interfaces/stores";
import { type StateCreator } from "zustand";

const createExampleSlice: StateCreator<
    ExampleState,
    [["zustand/immer", never]],
    [],
    ExampleState
> = (set) => ({
    example: {
        score: 0,
        increase: () =>
            set((state) => {
                state.example.score += 1;
            }),
        resetScore: () =>
            set((state) => {
                state.example.score = 0;
            }),
    },
});

export default createExampleSlice;
