import type { ApiClient, ApiRequestConfig } from "@/interfaces/apiClient";

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
    constructor(private apiClient: ApiClient) {}

    getUsers = async () => {
        return (await this.apiClient.get<User[]>("/users")).data;
    };

    getUsersWithCacheProof = async () => {
        return (
            await this.apiClient.get<{ generatedAt: number }>(
                "/users/cache-proof",
            )
        ).data;
    };

    getUserById = async (id: number, config?: ApiRequestConfig) => {
        //? permet de crée une logique pour mettre les config axios voulut en rapport avec config
        return (await this.apiClient.get<User>(`/users/${id}`, config)).data;
    };

    createUser = async (data: CreateUserDto) => {
        return (await this.apiClient.post<User>("/users", data)).data;
    };

    updateUser = async (id: number, data: Partial<CreateUserDto>) => {
        return (await this.apiClient.patch<User>(`/users/${id}`, data)).data;
    };

    deleteUser = async (id: number) => {
        return this.apiClient.delete(`/users/${id}`);
    };
}
