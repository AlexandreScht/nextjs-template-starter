import { defaultRateLimitConfig } from "@/config/rateLimit";
import type { RateLimitConfig, RateLimiter } from "@/types/rateLimit";

export class TokenBucketRateLimiter implements RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillRate: number;
    private readonly failOnLimit: boolean;
    private readonly timeoutMs: number;

    constructor(config: RateLimitConfig) {
        this.maxTokens = config.maxRequests;
        this.tokens = config.maxRequests;
        this.lastRefill = Date.now();
        this.refillRate = config.maxRequests / config.windowMs;
        this.failOnLimit = config.failOnLimit ?? false;
        this.timeoutMs = config.timeoutMs ?? 0;
    }

    private refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const newTokens = elapsed * this.refillRate;

        if (newTokens > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
            this.lastRefill = now;
        }
    }

    async consume(): Promise<void> {
        return this.consumeInternal(Date.now());
    }

    private async consumeInternal(startTime: number): Promise<void> {
        this.refill();

        if (this.tokens >= 1) {
            this.tokens -= 1;
            return Promise.resolve();
        }

        if (this.failOnLimit) {
            return Promise.reject(new Error("Rate limit exceeded"));
        }

        // Check timeout
        if (this.timeoutMs > 0 && Date.now() - startTime > this.timeoutMs) {
            return Promise.reject(new Error("Rate limit timeout exceeded"));
        }

        // Wait for enough tokens
        const missingTokens = 1 - this.tokens;
        const waitTimeMs = Math.ceil(missingTokens / this.refillRate);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.consumeInternal(startTime).then(resolve).catch(reject);
            }, waitTimeMs);
        });
    }

    reset() {
        this.tokens = this.maxTokens;
        this.lastRefill = Date.now();
    }
}

/**
 * Creates a new rate limiter based on configuration.
 * Does NOT cache instances.
 */
export function createRateLimiter(
    config: Partial<RateLimitConfig> = {},
): RateLimiter {
    const finalConfig: RateLimitConfig = {
        ...defaultRateLimitConfig,
        ...config,
    };

    return new TokenBucketRateLimiter(finalConfig);
}

/**
 * Default global rate limiter instance (using default config).
 */
export const defaultRateLimiter = createRateLimiter(defaultRateLimitConfig);
