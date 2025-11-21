import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("L'email doit être valide"),
});

export const UserSchema = CreateUserSchema.extend({
    id: z.number(),
});

export const UpdateUserSchema = CreateUserSchema.partial(); // Permet tous les champs optionnels pour l'update

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserSchema>;
