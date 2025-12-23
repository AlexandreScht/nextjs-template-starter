export interface User {
    id: number;
    name: string;
    email: string;
}

export const usersStore: {
    list: User[];
    nextId: number;
} = {
    list: [
        { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
        { id: 2, name: "Alan Turing", email: "alan@example.com" },
        { id: 3, name: "Grace Hopper", email: "grace@example.com" },
    ],
    nextId: 4,
};

export const wait = (ms = 800) =>
    new Promise((resolve) => setTimeout(resolve, ms));
