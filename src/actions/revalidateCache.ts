"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Type definition for the revalidateTag profile argument
 * based on the documentation (string or object with expire).
 */
type RevalidationProfile = "max" | { expire?: number };

/**
 * Server action to revalidate cache by tag or path.
 * @param type - 'tag' or 'page'
 * @param value - The tag name or path to revalidate
 * @param profile - (Optional) Only for tags. Defaults to 'max' (stale-while-revalidate).
 * Pass { expire: 0 } for immediate expiration.
 */
export async function revalidateCache(
    type: "tag" | "page",
    value: string,
    profile: RevalidationProfile = "max",
) {
    try {
        if (type === "tag") {
            revalidateTag(value, profile);
        } else {
            revalidatePath(value, "page");
        }
        return { success: true, message: `Revalidated ${type}: ${value}` };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            message: `Failed to revalidate ${type}: ${value}. Error: ${errorMessage}`,
        };
    }
}
