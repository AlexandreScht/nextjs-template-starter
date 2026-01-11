import { type QueryClientConfig } from "@tanstack/react-query";

export const serviceConfig = {
    client: {
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    },
    allowedCorsOrigins: [
        "https://api.stripe.com",
        "https://auth.monservice.com",
        // Ajoutez vos services tiers ici
    ],
    refreshTokenRoute: "/auth/refresh_token",
    referrerPolicy: "strict-origin-when-cross-origin",
} satisfies {
    client: QueryClientConfig;
    allowedCorsOrigins: string[];
    refreshTokenRoute: string;
    referrerPolicy: ReferrerPolicy;
};
