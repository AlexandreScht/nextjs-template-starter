import { cacheManagerConfig } from "@/config/cacheManager";
import QuickLRU from "quick-lru";

class CacheManager {
    private cache: QuickLRU<string, CacheEntry>;
    private tagMap: Map<string, Set<string>>;
    private readonly defaultTTL = cacheManagerConfig.defaultTTL;
    private readonly defaultMaxSize = cacheManagerConfig.defaultMaxSize;

    constructor() {
        this.cache = new QuickLRU({ maxSize: this.defaultMaxSize });
        this.tagMap = new Map();
    }

    /**
     * Récupère une valeur du cache
     * @param key - Clé de cache
     * @returns Données si valides, undefined sinon
     */
    get<T = unknown>(key: string): T | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.delete(key);
            return undefined;
        }

        return entry.data as T;
    }

    /**
     * Stocke une valeur dans le cache
     * @param key - Clé de cache
     * @param data - Données à stocker
     * @param config - Configuration du cache
     */
    set<T = unknown>(key: string, data: T, config: CacheConfig = {}): void {
        const { ttl = this.defaultTTL, tags = [] } = config;

        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            tags,
        };

        this.cache.set(key, entry);

        tags.forEach((tag) => {
            if (!this.tagMap.has(tag)) {
                this.tagMap.set(tag, new Set());
            }
            this.tagMap.get(tag)!.add(key);
        });
    }

    /**
     * Vérifie si une clé existe et est valide
     * @param key - Clé à vérifier
     * @returns true si la clé existe et est valide
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Supprime une entrée du cache
     * @param key - Clé à supprimer
     */
    delete(key: string): boolean {
        const entry = this.cache.get(key);

        if (entry) {
            entry.tags.forEach((tag) => {
                const keys = this.tagMap.get(tag);
                if (keys) {
                    keys.delete(key);
                    if (keys.size === 0) {
                        this.tagMap.delete(tag);
                    }
                }
            });
        }

        return this.cache.delete(key);
    }

    /**
     * Revalide (supprime) les entrées par clé
     * @param key - Clé à revalider
     */
    revalidateByKey(key: string): void {
        this.delete(key);
    }

    /**
     * Revalide (supprime) les entrées par tags
     * @param tags - Tags à revalider
     */
    revalidateByTags(tags: string[]): void {
        const keysToDelete = new Set<string>();

        tags.forEach((tag) => {
            const keys = this.tagMap.get(tag);
            if (keys) {
                keys.forEach((key) => keysToDelete.add(key));
            }
        });

        keysToDelete.forEach((key) => this.delete(key));
    }

    /**
     * Mute (modifie) une entrée du cache par clé
     * @param key - Clé à muter
     * @param value - Nouvelle valeur ou fonction de transformation
     */
    mutateByKey<T = unknown>(
        key: string,
        value: T | ((oldValue: T) => T),
    ): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        const newData =
            typeof value === "function"
                ? (value as (oldValue: T) => T)(entry.data as T)
                : value;

        // Mise à jour de l'entrée en conservant les métadonnées
        this.cache.set(key, {
            ...entry,
            data: newData,
            timestamp: Date.now(), // Réinitialisation du timestamp
        });

        return true;
    }

    /**
     * Mute (modifie) les entrées du cache par tags
     * @param tags - Tags à muter
     * @param value - Nouvelle valeur ou fonction de transformation
     */
    mutateByTags<T = unknown>(
        tags: string[],
        value: T | ((oldValue: T) => T),
    ): number {
        const keysToMutate = new Set<string>();

        tags.forEach((tag) => {
            const keys = this.tagMap.get(tag);
            if (keys) {
                keys.forEach((key) => keysToMutate.add(key));
            }
        });

        let mutatedCount = 0;
        keysToMutate.forEach((key) => {
            if (this.mutateByKey(key, value)) {
                mutatedCount++;
            }
        });

        return mutatedCount;
    }

    /**
     * Vide complètement le cache
     */
    clear(): void {
        this.cache.clear();
        this.tagMap.clear();
    }

    /**
     * Nettoie les entrées expirées
     */
    cleanup(): number {
        const now = Date.now();
        let cleanedCount = 0;

        const keys = Array.from(this.cache.keys());
        keys.forEach((key) => {
            const entry = this.cache.get(key);
            if (entry && now - entry.timestamp > entry.ttl) {
                this.delete(key);
                cleanedCount++;
            }
        });

        return cleanedCount;
    }
}

export const cacheManager = new CacheManager();
