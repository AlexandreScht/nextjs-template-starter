import type { ApiClient } from "@/interfaces/apiClient";
import { ExampleService } from "./example.service";

export const createServices = (apiClient: ApiClient) => {
    return {
        client: apiClient,
        users: new ExampleService(apiClient),
    };
};

export type Services = ReturnType<typeof createServices>;
