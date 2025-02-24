import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { CacheAdapter, CacheEntry } from "../types";

/**
 * Generates a file-system–friendly name by hashing the cache key.
 * @param key - The unique cache key.
 * @returns The hashed file name.
 */
function getCacheId(key: string): string {
    return crypto.createHash("md5").update(key).digest("hex");
}

/**
 *
 * File-system cache adapter that stores each variant in its own subdirectory like Next/Image
 *
 * Dir structure:
 *  .cache/images/
 *      <identifier>/
 *          <timestamp>.<randomHash>.<format>   // optimized img file
 *          meta.json                           // metadata with expiration && filename
 *
 */

export class FSCacheAdapter implements CacheAdapter {
    private cacheDir: string;

    constructor(cacheDir: string) {
        this.cacheDir = cacheDir;
        // Ensure the cache directory exists.
        fs.mkdir(this.cacheDir, { recursive: true }).catch((err) => {
            console.error(
                `Failed to create cache directory at ${this.cacheDir}:`,
                err
            );
        });
    }

    /**
     * Checks whether a cached entry exists for a given key.
     * @param key - The cache key.
     * @returns A Promise resolving to the CacheEntry or null if not found.
     */
    async has(key: string): Promise<boolean> {
        const id = getCacheId(key);
        const variantDir = path.join(this.cacheDir, id);
        const metaPath = path.join(variantDir, "meta.json");

        try {
            await fs.access(metaPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Retrieves a cached entry if it exists.
     * @param key - The cache key.
     * @returns A Promise resolving to the CacheEntry or null if not found.
     */
    async get(key: string): Promise<CacheEntry | null> {
        const id = getCacheId(key);
        const variantDir = path.join(this.cacheDir, id);

        try {
            // Read metadata file first.
            const metaPath = path.join(variantDir, "meta.json");
            const metaData = await fs.readFile(metaPath, "utf-8");
            const { expiration, imageFilename } = JSON.parse(metaData) as {
                expiration: number;
                imageFilename: string;
            };

            // Read cached data.
            const imagePath = path.join(variantDir, imageFilename);
            const data = await fs.readFile(imagePath);
            return { data, expiration };
        } catch (err) {
            // If files are missing or an error occurs, treat as cache miss.
            return null;
        }
    }

    /**
     * Stores a new cache entry.
     * @param key - The cache key.
     * @param data - The image data as a Buffer.
     * @param ttl - Time-to-live in seconds.
     * @param options - Optional obj with the image format ("jpeg, "webp", etc)
     */
    async set(
        key: string,
        data: Buffer,
        ttl: number,
        options?: { format: string }
    ): Promise<void> {
        const id = getCacheId(key);
        const variantDir = path.join(this.cacheDir, id);

        try {
            await fs.mkdir(variantDir, { recursive: true });
        } catch (error) {
            console.error(`Error is attempting to make dir: ${variantDir}`);
        }

        const expiration = Date.now() + ttl * 1000;
        const timestamp = Date.now();
        const randomHash = crypto.randomBytes(16).toString("hex");
        const format = options?.format || "jpeg"; // default to jpeg?
        const imageFilename = `${timestamp}.${randomHash}.${format}`;
        const imagePath = path.join(variantDir, imageFilename);

        try {
            await fs.writeFile(imagePath, data);
        } catch (error) {
            console.error(
                `Error is attempting to write file with path: ${imagePath}`
            );
        }

        const meta = { expiration, imageFilename };
        const metaPath = path.join(variantDir, "meta.json");

        try {
            await fs.writeFile(metaPath, JSON.stringify(meta));
        } catch (error) {
            console.error(
                `Error is attempting to write file with path: ${metaPath}`
            );
        }
    }

    /**
     * Updates an existing cache entry with new data and TTL.
     * If the cache entry does not exist then it should behave like `set`.
     * @param key - The cache key.
     * @param data - The updated image data.
     * @param ttl - New TTL in seconds.
     * @param options -
     */
    async update(
        key: string,
        data: Buffer,
        ttl: number,
        options?: { format: string }
    ): Promise<void> {
        // In our simple adapter, update is the same as set (overwrite).
        return this.set(key, data, ttl, options);
    }

    /**
     * Deletes a cache entry.
     * @param key - The cache key.
     */
    async delete(key: string): Promise<void> {
        const id = getCacheId(key);
        const variantDir = path.join(this.cacheDir, id);

        try {
            await fs.rm(variantDir, { recursive: true, force: true });
        } catch (error) {
            console.error(
                `Error attempting to remove image '${id}' from variant dir '${variantDir}'.`
            );
        }
    }
}
