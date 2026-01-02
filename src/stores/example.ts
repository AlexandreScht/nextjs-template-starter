import { type SliceStore } from "@/interfaces/stores";
import { type ExampleState } from "@/interfaces/storeStates";

const createExampleSlice: SliceStore<ExampleState> = (set) => ({
    example: {
        score: 0,
        increase: () =>
            set((state: ExampleState) => {
                state.example.score += 1;
            }),
        resetScore: () =>
            set((state: ExampleState) => {
                state.example.score = 0;
            }),
    },
});

export default createExampleSlice;
