import { Elysia, t } from "elysia";
import type { User } from "@/app/api/users/data";

// 1. On simule l'application et la route
export const app = new Elysia()
    .get(
        "/test",
        () => {
            // Ici on définit le type de retour (la réponse)
            return {
                message: "Ceci est une donnée mockée",
                id_recu: "123",
            };
        },
        {
            // 2. Ici on définit les paramètres d'entrée (Query)
            query: t.Object({
                id: t.String(), // ou t.Numeric() si tu attends un nombre
            }),
        },
    )
    .group("/users", (app) =>
        app
            .get("/", () => [] as User[])
            .post(
                "/",
                ({ body }) => {
                    return body as User;
                },
                {
                    body: t.Object({
                        name: t.String({ minLength: 2 }),
                        email: t.String({ format: "email" }),
                        password: t.String({ minLength: 8 }),
                    }),
                },
            )
            .get(
                "/:id",
                () => {
                    return {} as User;
                },
                {
                    params: t.Object({
                        id: t.Numeric(),
                    }),
                },
            )
            .patch(
                "/:id",
                ({ body }) => {
                    return body as User;
                },
                {
                    params: t.Object({
                        id: t.Numeric(),
                    }),
                    body: t.Object({
                        name: t.String({ minLength: 2 }),
                        email: t.String({ format: "email" }),
                    }),
                },
            )
            .delete(
                "/:id",
                () => {
                    return { success: true };
                },
                {
                    params: t.Object({
                        id: t.Numeric(),
                    }),
                },
            ),
    );

export type App = typeof app;
