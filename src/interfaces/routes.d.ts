export type QueryType<T> =
    T extends Record<string, string | number | boolean | unknown[]>
        ? T
        : Record<string, string | number | boolean | unknown[]>;

export type ParamsType<T> = T extends (string | number | boolean)[]
    ? T
    : (string | number | boolean)[];

// Corrections ici : Utilisation des types définis correctement
export type QueryRoutesType = (value?: QueryType<unknown>) => string;
export type ParamsRoutesType = (value?: ParamsType<unknown>) => string;
export type PropsRoutesType = (value?: ParamsType<unknown>) => string;

// Modification de RoutesPropsType pour accepter plusieurs paramètres
export type RoutesPropsType = (...args: any[]) => string;

export interface RouteObject {
    [key: string]: RoutesPropsType | RouteObject;
}
