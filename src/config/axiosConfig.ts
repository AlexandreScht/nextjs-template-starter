export const axiosConfig = {
    TOKEN_KEYS: {
        access: "access_token",
        refresh: "refresh_token",
    },
    REFRESH_ENDPOINT: "/auth/refresh",
} satisfies Record<string, string | Record<string, string>>;
