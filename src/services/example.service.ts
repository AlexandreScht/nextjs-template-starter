import type { ApiClient, ApiRequestConfig } from "@/interfaces/apiClient";
import type { CreateUserDto, User } from "@/interfaces/models/users";
import { apiClientPortal } from "@/libs/apiClientPortal";
import { validate } from "@/middlewares/validator";
import apiRoutes from "@/router/api";
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserSchema,
} from "@/validators/user.schema";

export class ExampleService {
    private router = apiRoutes.api.users;
    constructor(private apiClient: ApiClient) {}

    async getUsers() {
        return (await this.apiClient.get<User[]>(this.router.list())).data;
    }

    async getUsersWithCacheProof() {
        const [users, proof] = await Promise.all([
            this.getUsers(),
            (
                await this.apiClient.get<{ generatedAt: number }>(
                    this.router.cacheProof(),
                )
            ).data,
        ]);

        return {
            users,
            cacheProof: proof.generatedAt,
        };
    }

    async getUserById(id: number, config?: ApiRequestConfig) {
        return await apiClientPortal({
            rateLimitConfig: { maxRequests: 20 },
            requestValidator: () => validate(UserSchema, { id }),
            request: (v) =>
                this.apiClient.get<User>(this.router.getById(v.id), config),
            responseValidator: (data) => validate(UserSchema, data),
            onSuccess: (data) => data,
            onError: (error) => {
                console.error(
                    "Erreur lors de la récupération de l'utilisateur",
                    error,
                );
                throw error;
            },
        });
    }

    async createUser(data: CreateUserDto) {
        return await apiClientPortal({
            requestValidator: () => validate(CreateUserSchema, data),
            request: (validData) =>
                this.apiClient.post<User>(this.router.create(), validData),
            responseValidator: (d) => validate(UserSchema, d),
            onSuccess: (user) => user,
            onError: (error) => {
                console.error("Erreur création user", error);
                throw error;
            },
        });
    }

    async updateUser(id: number, data: Partial<CreateUserDto>) {
        return await apiClientPortal({
            requestValidator: () => validate(UpdateUserSchema, data),
            request: (validData) =>
                this.apiClient.patch<User>(this.router.getById(id), validData),
            responseValidator: (d) => validate(UserSchema, d),
            onSuccess: (user) => user,
        });
    }

    async deleteUser(id: number) {
        return this.apiClient.delete(this.router.delete(id));
    }
}
