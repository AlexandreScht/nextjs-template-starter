"use server";

import { cacheManager } from "@/libs/cacheManager";
import { revalidatePath } from "next/cache";

/**
 * Récupère une valeur du cache
 */
export async function getCacheValue(key: string): Promise<CacheActionResult> {
    try {
        const value = cacheManager.get(key);
        return {
            success: true,
            message: value ? "Valeur trouvée" : "Clé non trouvée",
            data: value,
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Stocke une valeur dans le cache
 */
export async function setCacheValue(
    key: string,
    value: string,
    ttl?: number,
    tags?: string[],
): Promise<CacheActionResult> {
    try {
        const parsedValue = JSON.parse(value);
        cacheManager.set(key, parsedValue, {
            ttl: ttl ? ttl * 1000 : undefined,
            tags,
        });
        revalidatePath("/server-cache");
        return {
            success: true,
            message: "Valeur mise en cache avec succès",
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Supprime une entrée du cache par clé
 */
export async function deleteCacheByKey(
    key: string,
): Promise<CacheActionResult> {
    try {
        const deleted = cacheManager.delete(key);
        revalidatePath("/server-cache");
        return {
            success: deleted,
            message: deleted
                ? "Entrée supprimée avec succès"
                : "Clé non trouvée",
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Revalide les entrées par tags
 */
export async function revalidateByTags(
    tagsString: string,
): Promise<CacheActionResult> {
    try {
        const tags = tagsString.split(",").map((t) => t.trim());
        cacheManager.revalidateByTags(tags);
        revalidatePath("/server-cache");
        return {
            success: true,
            message: `Entrées avec les tags [${tags.join(", ")}] revalidées`,
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Mute une entrée par clé
 */
export async function mutateCacheByKey(
    key: string,
    newValue: string,
): Promise<CacheActionResult> {
    try {
        const parsedValue = JSON.parse(newValue);
        const mutated = cacheManager.mutateByKey(key, parsedValue);
        revalidatePath("/server-cache");
        return {
            success: mutated,
            message: mutated ? "Entrée mutée avec succès" : "Clé non trouvée",
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Mute les entrées par tags
 */
export async function mutateCacheByTags(
    tagsString: string,
    newValue: string,
): Promise<CacheActionResult> {
    try {
        const tags = tagsString.split(",").map((t) => t.trim());
        const parsedValue = JSON.parse(newValue);
        const count = cacheManager.mutateByTags(tags, parsedValue);
        revalidatePath("/server-cache");
        return {
            success: count > 0,
            message: `${count} entrée(s) mutée(s)`,
            data: count,
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Vide complètement le cache
 */
export async function clearCache(): Promise<CacheActionResult> {
    try {
        cacheManager.clear();
        revalidatePath("/server-cache");
        return {
            success: true,
            message: "Cache vidé avec succès",
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}

/**
 * Nettoie les entrées expirées
 */
export async function cleanupCache(): Promise<CacheActionResult> {
    try {
        const count = cacheManager.cleanup();
        revalidatePath("/server-cache");
        return {
            success: true,
            message: `${count} entrée(s) expirée(s) nettoyée(s)`,
            data: count,
        };
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        };
    }
}
