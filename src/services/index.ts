import type { AxiosInstance } from "axios";
import { ExampleService } from "./example.service";

export const createServices = (apiClient: AxiosInstance) => {
    return {
        client: apiClient,
        users: new ExampleService(apiClient),
    } as const;
};

export type Services = ReturnType<typeof createServices>;
