export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed within the window.
     */
    maxRequests: number;

    /**
     * Time window in milliseconds.
     */
    windowMs: number;

    /**
     * Optional: Throw an error if rate limit is exceeded instead of waiting.
     * Default: false (waits for tokens)
     */
    failOnLimit?: boolean;

    /**
     * Optional: Maximum time to wait for a token in milliseconds.
     * If 0, waits indefinitely (unless failOnLimit is true).
     * Default: 0
     */
    timeoutMs?: number;
}

export interface RateLimiter {
    /**
     * Consumes a token. Resolves when a token is available.
     * Rejects if failOnLimit is true and limit is exceeded.
     */
    consume(): Promise<void>;

    /**
     * Resets the rate limiter state.
     */
    reset(): void;
}
