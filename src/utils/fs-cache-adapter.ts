import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { CacheAdapter, CacheEntry } from "../types";

/**
 * Generates a file-system–friendly name by hashing the cache key.
 * @param key - The unique cache key.
 * @returns The hashed file name.
 */
function getCacheFileName(key: string): string {
    return crypto.createHash("md5").update(key).digest("hex");
}

export class FileSystemCacheAdapter implements CacheAdapter {
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
     * Construct paths for cached data and metadata.
     */
    private getPaths(key: string): { dataPath: string; metaPath: string } {
        const fileName = getCacheFileName(key);
        const dataPath = path.join(this.cacheDir, `${fileName}.cache`);
        const metaPath = path.join(this.cacheDir, `${fileName}.meta.json`);
        return { dataPath, metaPath };
    }

    /**
     * Retrieves a cached entry if it exists.
     * @param key - The cache key.
     * @returns A Promise resolving to the CacheEntry or null if not found.
     */
    async get(key: string): Promise<CacheEntry | null> {
        const { dataPath, metaPath } = this.getPaths(key);
        try {
            // Read metadata file first.
            const metaData = await fs.readFile(metaPath, "utf-8");
            const { expiration } = JSON.parse(metaData) as {
                expiration: number;
            };

            // Read cached data.
            const data = await fs.readFile(dataPath);
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
     */
    async set(key: string, data: Buffer, ttl: number): Promise<void> {
        const { dataPath, metaPath } = this.getPaths(key);
        const expiration = Date.now() + ttl * 1000;
        await fs.writeFile(dataPath, data);
        await fs.writeFile(metaPath, JSON.stringify({ expiration }));
    }

    /**
     * Updates an existing cache entry with new data and TTL.
     * If the cache entry does not exist then it should behave like `set`.
     * @param key - The cache key.
     * @param data - The updated image data.
     * @param ttl - New TTL in seconds.
     */
    async update(key: string, data: Buffer, ttl: number): Promise<void> {
        // In our simple adapter, update is the same as set (overwrite).
        return this.set(key, data, ttl);
    }

    /**
     * Deletes a cache entry.
     * @param key - The cache key.
     */
    async delete(key: string): Promise<void> {
        const { dataPath, metaPath } = this.getPaths(key);
        // Remove both the data and metadata files
        // Ignore errors if they don't exist
        await Promise.all([
            fs.unlink(dataPath).catch(() => {}),
            fs.unlink(metaPath).catch(() => {}),
        ]);
    }
}
