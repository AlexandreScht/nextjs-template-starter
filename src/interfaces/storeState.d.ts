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
