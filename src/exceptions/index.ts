import type { ValidationErrorDetail } from "../interfaces/validator";

export class ClientException extends Error {
    public status: number | string;
    public message: string;

    constructor(
        status: number | string = 500,
        message: string | string[] = "Une erreur s'est produite",
    ) {
        super(Array.isArray(message) ? message.join(" | ") : message);
        this.status = status;
        this.message = Array.isArray(message) ? message.join(" | ") : message;
    }
}

export class NotFoundError extends ClientException {
    constructor(message: string[] | string = "Ressource non trouvée") {
        super(404, message);
    }
}

export class InvalidArgumentError extends ClientException {
    constructor(message: string[] | string = "Arguments invalides") {
        super(422, message);
    }
}

export class InvalidCredentialsError extends ClientException {
    constructor(message: string[] | string = "Identifiants invalides") {
        super(401, message);
    }
}

export class InvalidAccessError extends ClientException {
    constructor(message: string[] | string = "Permission insuffisante") {
        super(403, message);
    }
}

export class ExpiredSessionError extends ClientException {
    constructor(message: string[] | string = "Session expired") {
        super(999, message);
    }
}
export class InvalidRoleAccessError extends ClientException {
    constructor(
        message: string[] | string = "Veuillez mettre à jour votre abonnement",
    ) {
        super(605, message);
    }
}
export class ServiceError extends ClientException {
    constructor(code: string, message: string) {
        super(code, message);
    }
}

export class ValidationException extends ClientException {
    public details: ValidationErrorDetail[];

    constructor(details: ValidationErrorDetail[]) {
        super(422, "Validation Failed");
        this.details = details;
    }
}
