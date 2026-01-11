import type { CreateUserDto } from "@/interfaces/modelsDto";
import { servicesInstance } from "@/libs/servicesInstance";
import { validate } from "@/middlewares/validator";
import { type serviceOptions } from "@/types/service";
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserSchema,
} from "@/validators/user.schema";
import { ApiClientPortal } from "@/libs/apiClientPortal";

export class ExampleService<
    TOpts = serviceOptions,
> extends ApiClientPortal<TOpts> {
    private request = servicesInstance.users;

    constructor(defaultOptions?: TOpts) {
        super(defaultOptions);
    }

    async getUsers() {
        return await this.apiClientPortal({
            rateLimitConfig: { maxRequests: 20 },
            request: () => this.request.get(),
            onError: (error) => {
                throw error;
            },
        });
    }

    async getUserById(id: number) {
        return await this.apiClientPortal({
            rateLimitConfig: { maxRequests: 20 },
            requestValidator: () => validate(UserSchema, { id }),
            request: (v) => this.request({ id: v.id }).get(),
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

    async createUser(createUserDto: CreateUserDto) {
        return await this.apiClientPortal({
            requestValidator: () => validate(CreateUserSchema, createUserDto),
            request: (v) => this.request.post(v),
            responseValidator: (data) => validate(UserSchema, data),
            onError: (error) => {
                throw error;
            },
        });
    }

    async updateUser(id: number, updateUserDto: Partial<CreateUserDto>) {
        return await this.apiClientPortal({
            requestValidator: () => validate(UpdateUserSchema, updateUserDto),
            request: (v) => this.request({ id }).patch(v),
            responseValidator: (data) => validate(UserSchema, data),
            onError: (error) => {
                throw error;
            },
        });
    }

    async deleteUser(id: number) {
        console.log("ici");

        return await this.apiClientPortal({
            request: () => this.request({ id }).delete(),
            onError: (error) => {
                throw error;
            },
        });
    }
}
