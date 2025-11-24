import { type $ZodErrorMap, type $ZodIssue } from "zod/v4/core";

export const customErrorMap: $ZodErrorMap<$ZodIssue> = (
    issue,
    ctx?: { defaultError?: string; data?: any },
): { message: string } => {
    const err = issue as any;
    let message = ctx?.defaultError || "Valeur invalide";

    switch (issue.code) {
        case "invalid_type":
            if (err.received === "undefined") {
                message = "Ce champ est requis";
            } else {
                message = `Type invalide : attendu ${err.expected}, reçu ${err.received}`;
            }
            break;
        case "invalid_format":
            if (err.validation === "email" || err.format === "email") {
                message = "Format d'email invalide";
            } else if (err.validation === "url" || err.format === "url") {
                message = "URL invalide";
            } else if (err.validation === "uuid" || err.format === "uuid") {
                message = "UUID invalide";
            }
            break;
        case "too_small":
            if ((err.type || err.origin) === "string") {
                message = `Le champ doit contenir au moins ${err.minimum} caractère(s)`;
            } else if ((err.type || err.origin) === "number") {
                message = `La valeur doit être supérieure ou égale à ${err.minimum}`;
            } else if ((err.type || err.origin) === "array") {
                message = `La liste doit contenir au moins ${err.minimum} élément(s)`;
            }
            break;
        case "too_big":
            if ((err.type || err.origin) === "string") {
                message = `Le champ ne doit pas dépasser ${err.maximum} caractère(s)`;
            } else if ((err.type || err.origin) === "number") {
                message = `La valeur doit être inférieure ou égale à ${err.maximum}`;
            } else if ((err.type || err.origin) === "array") {
                message = `La liste ne doit pas dépasser ${err.maximum} élément(s)`;
            }
            break;
        case "custom":
            message = issue.message || "Validation invalide";
            break;
    }

    return { message };
};
