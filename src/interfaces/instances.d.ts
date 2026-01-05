export interface RequestContext {
    metadata?: {
        startTime?: number;
    };
    headers?: HeadersInit;
    url?: string;
    method?: string;
    [key: string]: any;
}
