import type { RateLimitConfig } from "@/interfaces/rateLimit";

export const defaultRateLimitConfig: RateLimitConfig = {
    maxRequests: 10, // 10 requests
    windowMs: 1000, // per 1 second
    failOnLimit: false, // Wait by default
    timeoutMs: 0, // Wait indefinitely
};
