import crypto from "crypto";

// Generates a cached key based on the url and transform options.
export function generateCacheKey(
    src: string,
    options: Record<string, any>
): string {
    const key = JSON.stringify({ src, ...options });
    return crypto.createHash("md5").update(key).digest("hex");
}
