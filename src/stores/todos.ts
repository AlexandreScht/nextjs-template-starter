import { type TodoState } from "@/interfaces/stores";
import { type StateCreator } from "zustand";

const createTodoSlice: StateCreator<
    TodoState,
    [["zustand/immer", never]],
    [],
    TodoState
> = (set) => ({
    todos: {
        list: [],
        addTodo: (text: string) =>
            set((state) => {
                state.todos.list.push({
                    id: crypto.randomUUID(),
                    text,
                    completed: false,
                });
            }),
        removeTodo: (id: string) =>
            set((state) => {
                const index = state.todos.list.findIndex(
                    (t: { id: string }) => t.id === id,
                );
                if (index !== -1) {
                    state.todos.list.splice(index, 1);
                }
            }),
        toggleTodo: (id: string) =>
            set((state) => {
                const todo = state.todos.list.find(
                    (t: { id: string }) => t.id === id,
                );
                if (todo) {
                    todo.completed = !todo.completed;
                }
            }),
    },
});

export default createTodoSlice;
