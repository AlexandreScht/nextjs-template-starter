interface CacheConfig {
    /** Durée de vie en secondes */
    ttl?: number;
    /** Taille maximale du cache */
    maxSize?: number;
    /** Tags associés à cette entrée de cache */
    tags?: string[];
}

interface CacheEntry<T = unknown> {
    /** Données mises en cache */
    data: T;
    /** Timestamp de création */
    timestamp: number;
    /** TTL en millisecondes */
    ttl: number;
    /** Tags associés */
    tags: string[];
}

interface CacheActionResult {
    success: boolean;
    message: string;
    data?: unknown;
}

interface CacheManagerConfig {
    defaultTTL: number;
    defaultMaxSize: number;
}
