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
            .post("/", () => ({}))
            .get("/:id", () => ({}))
            .patch("/:id", () => ({}))
            .delete("/:id", () => ({})),
    );

export type App = typeof app;
