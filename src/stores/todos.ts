import { type SliceStore } from "@/interfaces/stores";
import { type TodoState } from "@/interfaces/storeState";

const createTodoSlice: SliceStore<TodoState> = (set) => ({
    todos: {
        list: [],
        addTodo: (text: string) =>
            set((state: TodoState) => {
                state.todos.list.push({
                    id: crypto.randomUUID(),
                    text,
                    completed: false,
                });
            }),
        removeTodo: (id: string) =>
            set((state: TodoState) => {
                const index = state.todos.list.findIndex((t) => t.id === id);
                if (index !== -1) {
                    state.todos.list.splice(index, 1);
                }
            }),
        toggleTodo: (id: string) =>
            set((state: TodoState) => {
                const todo = state.todos.list.find((t) => t.id === id);
                if (todo) {
                    todo.completed = !todo.completed;
                }
            }),
    },
});

export default createTodoSlice;
