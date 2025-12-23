export type SetStoreState<T> = (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean | undefined,
) => void;

export type GetStoreState<T> = () => T;

export interface ExampleState {
    example: {
        score: number;
        increase: () => void;
        resetScore: () => void;
    };
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

export interface TodoState {
    todos: {
        list: Todo[];
        addTodo: (text: string) => void;
        removeTodo: (id: string) => void;
        toggleTodo: (id: string) => void;
    };
}
