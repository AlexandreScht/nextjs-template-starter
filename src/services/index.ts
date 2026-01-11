// src/services/index.ts
import { servicesInstance } from "@/libs/servicesInstance";
import { ExampleService } from "./example.service";
import { type serviceOptions } from "@/types/service";

class Services<TOpts = serviceOptions> {
    constructor(private options?: TOpts) {}

    with(overrides: TOpts): Services<TOpts> {
        const merged = { ...this.options, ...overrides };
        return new Services<TOpts>(merged);
    }

    get client() {
        return servicesInstance;
    }

    get users() {
        return new ExampleService<TOpts>(this.options);
    }
}

export const createServices = <TOpts = serviceOptions>(options?: TOpts) => {
    return new Services<TOpts>(options);
};
