import { z, ZodSchema } from "zod";

/**
 * Valide les données avec un schéma Zod.
 * Lance une erreur explicite si la validation échoue.
 * @param schema Le schéma Zod à utiliser
 * @param data Les données à valider
 * @returns Les données validées et typées
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errorMessages = result.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));

        throw new Error(
            `Validation Failed: ${JSON.stringify(errorMessages, null, 2)}`
        );
    }

    return result.data;
}
