import type { ApiClient, ApiRequestConfig } from "@/interfaces/apiClient";
import { apiClientPortal } from "@/libs/apiClientPortal";
import { validate } from "@/middlewares/validator.middleware";
import { CreateUserSchema, UpdateUserSchema, UserSchema } from "@/validators/user.schema";
// import { Guard } from "@/middlewares/auth.guard"; // Décommenter si besoin

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

    async getUsers() {
        return (await this.apiClient.get<User[]>("/users")).data;
    }

    async getUsersWithCacheProof() {
        return (
            await this.apiClient.get<{ generatedAt: number }>(
                "/users/cache-proof",
            )
        ).data;
    }

    async getUserById(id: number, config?: ApiRequestConfig) {
        return await apiClientPortal({
            payload: id,
            inputValidator: (d) => validate(UserSchema, d),
            request: this.apiClient.get<User>(`/users/${id}`, config),
            responseValidator: (data) => validate(UserSchema, data),
            onSuccess: (data) => data,
            onError: (error) => {
                console.error("Erreur lors de la récupération de l'utilisateur", error);
                throw error;
            },
        });
    }

    async createUser(data: CreateUserDto) {
        return await apiClientPortal({
            payload: data,
            inputValidator: (d) => validate(CreateUserSchema, d),
            request: (validData) => this.apiClient.post<User>("/users", validData),
            responseValidator: (d) => validate(UserSchema, d),
            onSuccess: (user) => user,
            onError: (error) => {
                console.error("Erreur création user", error);
                throw error;
            }
        });
    }

    async updateUser(id: number, data: Partial<CreateUserDto>) {
        return await apiClientPortal({
            payload: data,
            inputValidator: (d) => validate(UpdateUserSchema, d),
            request: (validData) => this.apiClient.patch<User>(`/users/${id}`, validData),
            responseValidator: (d) => validate(UserSchema, d),
            onSuccess: (user) => user,
        });
    }

    async deleteUser(id: number) {
        return this.apiClient.delete(`/users/${id}`);
    }
}
