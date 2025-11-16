import type { AxiosInstance } from "axios";

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
}

export class ExampleService {
    constructor(private apiClient: AxiosInstance) {}

    getUsers = async () => {
        const response = await this.apiClient.get<User[]>("/users");
        return response.data;
    };

    getUserById = async (id: number) => {
        const response = await this.apiClient.get<User>(`/users/${id}`);
        return response.data;
    };

    createUser = async (data: CreateUserDto) => {
        const response = await this.apiClient.post<User>("/users", data);
        return response.data;
    };

    updateUser = async (id: number, data: Partial<CreateUserDto>) => {
        const response = await this.apiClient.patch<User>(`/users/${id}`, data);
        return response.data;
    };

    deleteUser = async (id: number) => {
        await this.apiClient.delete(`/users/${id}`);
    };
}
