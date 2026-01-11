import { type SliceStore } from "@/types/stores";
import { type TodoState } from "@/interfaces/storeStates";

const createTodoSlice: SliceStore<TodoState> = (set) => ({
    todos: {
        list: [],
        addTodo: (text) =>
            set((state) => {
                state.todos.list.push({
                    id: crypto.randomUUID(),
                    text,
                    completed: false,
                });
            }),
        removeTodo: (id) =>
            set((state) => {
                const index = state.todos.list.findIndex((t) => t.id === id);
                if (index !== -1) {
                    state.todos.list.splice(index, 1);
                }
            }),
        toggleTodo: (id) =>
            set((state) => {
                const todo = state.todos.list.find((t) => t.id === id);
                if (todo) {
                    todo.completed = !todo.completed;
                }
            }),
    },
});

export default createTodoSlice;
