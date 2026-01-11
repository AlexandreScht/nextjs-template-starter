import type {
    ParamsType,
    QueryType,
    RouteObject,
    RoutesPropsType,
} from "@/types/routes";

export function createRouteWithProps(
    route: string,
    params?: ParamsType<unknown>,
    query?: QueryType<Record<string, unknown>>,
): string {
    let fullRoute = route;

    if (params) {
        const customParams = Array.isArray(params) ? params : [params];
        const ps = customParams
            .filter((v) => v)
            .map((v) => (v ? encodeURIComponent(v.toString()) : ""))
            .join("/");

        if (ps) {
            fullRoute += `/${ps}`;
        }
    }

    if (query) {
        const searchParams = new URLSearchParams();

        for (const key in query) {
            if (
                Object.prototype.hasOwnProperty.call(query, key) &&
                query[key] !== undefined
            ) {
                searchParams.append(key, query[key]?.toString());
            }
        }

        const qs = searchParams.toString();
        if (qs) {
            fullRoute += `?${qs}`;
        }
    }

    return fullRoute;
}

//* exemple: { key1: "value1", key2: 15 }
export function createRouteWithQueries(
    route: string,
    queries?: QueryType<unknown>,
): string {
    if (queries === undefined || queries === null) {
        return route;
    }

    const searchParams = new URLSearchParams();

    for (const key in queries) {
        if (
            Object.prototype.hasOwnProperty.call(queries, key) &&
            queries[key] !== undefined
        ) {
            searchParams.append(key, queries[key]?.toString());
        }
    }

    const qs = searchParams.toString();

    if (qs) {
        const cleanRoute = route.endsWith("/") ? route.slice(0, -1) : route;
        return `${cleanRoute}?${qs}`;
    }

    return route;
}

//* exemple: ["value1", 15]
export function createRouteWithParams(
    route: string,
    params?: ParamsType<unknown>,
): string {
    if (!params) {
        return route;
    }

    const customParams = Array.isArray(params) ? params : [params];

    const ps = customParams
        .filter((v) => v)
        .map((v) => (v ? encodeURIComponent(v.toString()) : ""))
        .join("/");

    const separator = route.endsWith("/") ? "" : "/";
    return ps ? `${route}${separator}${ps}` : route;
}

// Transform RouteObject structure
type TransformRoutes<T extends RouteObject> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
        ? (...args: any[]) => string
        : T[K] extends RouteObject
          ? TransformRoutes<T[K]>
          : never;
};

export function createRoutes<T extends RouteObject>(
    obj: T,
    basePath: string = "",
): TransformRoutes<T> {
    const buildRoute = (currentPath: string, currentObj: RouteObject): any => {
        const routeObj: Record<string, any> = {};

        for (const prop in currentObj) {
            const value = currentObj[prop];

            if (typeof value === "function") {
                routeObj[prop] = (args?: RoutesPropsType) => {
                    const routePath = value(args);
                    if (routePath.startsWith("/")) {
                        return currentPath + routePath;
                    }
                    return `${currentPath}/${routePath}`;
                };
            } else if (typeof value === "object" && value !== null) {
                const newPath = `${currentPath}/${prop}`;
                routeObj[prop] = buildRoute(newPath, value as RouteObject);
            }
        }

        return routeObj;
    };

    // Build the root level
    const root: Record<string, any> = {};

    for (const key in obj) {
        const value = obj[key];

        if (typeof value === "function") {
            root[key] = (args?: RoutesPropsType) => {
                const routePath = value(args);
                return basePath + routePath;
            };
        } else if (typeof value === "object" && value !== null) {
            const newPath = `${basePath}/${key}`;
            root[key] = buildRoute(newPath, value as RouteObject);
        }
    }

    return root as TransformRoutes<T>;
}
