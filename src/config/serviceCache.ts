import { type QueryClientConfig } from "@tanstack/react-query";

export const serviceCache = {
    client: {
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    },
    server: {},
} satisfies {
    client: QueryClientConfig;
    server: any;
};
