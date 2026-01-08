export interface ValidationErrorDetail {
    field: string;
    message: string;
}

export interface ZodIssueExtended {
    code: string;
    path: (string | number)[];
    message: string;
    received?: string;
    expected?: string;
    validation?: string;
    format?: string;
    type?: string;
    origin?: string;
    minimum?: number;
    maximum?: number;
    inclusive?: boolean;
}

export interface ZodErrorMapContext {
    defaultError?: string;
}

export type ZodErrorMapFunction = (
    issue: ZodIssueExtended,
    ctx: ZodErrorMapContext,
) => { message: string };
