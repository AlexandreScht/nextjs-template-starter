import { z, type ZodSchema } from "zod";
import { type $ZodErrorMap, type $ZodIssue } from "zod/v4/core";
import { ValidationException } from "../exceptions";
import type {
    ValidationErrorDetail,
    ZodIssueExtended,
} from "../types/validator";
import { customErrorMap } from "../utils/zodErrorMap";

z.config({ customError: customErrorMap as $ZodErrorMap<$ZodIssue> });

/**
 * Valide les données avec un schéma Zod.
 * Lance une ValidationException si la validation échoue.
 * @param schema Le schéma Zod à utiliser
 * @param data Les données à valider
 * @returns Les données validées et typées
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errorObj = result.error as {
            errors?: ZodIssueExtended[];
            issues?: ZodIssueExtended[];
            message?: string;
        };

        let issues: ZodIssueExtended[] =
            errorObj.errors || errorObj.issues || [];

        if (issues.length === 0 && errorObj.message) {
            try {
                const parsed = JSON.parse(errorObj.message);
                if (Array.isArray(parsed)) {
                    issues = parsed;
                }
            } catch (error) {
                console.error(
                    "Failed to parse error message as JSON:",
                    error instanceof Error ? error.message : String(error),
                );
            }
        }

        const errorMessages: ValidationErrorDetail[] = issues.map(
            (err: ZodIssueExtended) => ({
                field: Array.isArray(err.path)
                    ? err.path.join(".")
                    : String(err.path),
                message: err.message,
            }),
        );

        throw new ValidationException(errorMessages);
    }

    return result.data;
}
