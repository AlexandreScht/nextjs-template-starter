import { createRouteWithParams, createRoutes } from ".";

const apiRoutes = createRoutes({
    api: {
        refresh_token: () => "/auth/refresh",
        users: {
            list: () => "/",
            getById: (id?: number | string) =>
                createRouteWithParams("/", id ? [id] : undefined),
            create: () => "/create-user",
            cacheProof: () => "/cache-proof",
            delete: (id?: number | string) =>
                createRouteWithParams("/delete-user", id ? [id] : undefined),
        },
    },
});

export default apiRoutes;
