import type { AxiosInstance, AxiosRequestConfig } from "axios";

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

    getUsers = async (config?: AxiosRequestConfig) => {
        return (await this.apiClient.get<User[]>("/users", config)).data;
    };

    getUserById = async (id: number, config?: AxiosRequestConfig) => {
        return (await this.apiClient.get<User>(`/users/${id}`, config)).data;
    };

    createUser = async (data: CreateUserDto, config?: AxiosRequestConfig) => {
        return (await this.apiClient.post<User>("/users", data, config)).data;
    };

    updateUser = async (
        id: number,
        data: Partial<CreateUserDto>,
        config?: AxiosRequestConfig,
    ) => {
        return (await this.apiClient.patch<User>(`/users/${id}`, data, config)).data;
    };

    deleteUser = async (id: number, config?: AxiosRequestConfig) => {
        return this.apiClient.delete(`/users/${id}`, config);
    };
}
