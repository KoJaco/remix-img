/**
 * Represents a cached entry with its image data and expiration timestamp.
 */
export interface CacheEntry {
    data: Buffer;
    expiration: number; // Epoch time in ms when this cache entry expires.
}

export interface CacheAdapter {
    /**
     * Retrieve a cached image using a unique cache key.
     * @param key - The unique identifier for the cached image.
     * @returns Promise that resolves with the image Buffer or null if not found.
     */
    get: (key: string) => Promise<CacheEntry | null>;

    /**
     * Store an image in the cache with a time-to-live
     * @param key - The unique identifier for the cached image.
     * @param data - The image data as a Buffer.
     * @param ttl - Time-to-live for the cache entry in seconds.
     */
    set: (key: string, data: Buffer, ttl: number) => Promise<void>;

    /**
     * Update an existing cached image with new data and TTL.
     * If the image doesn't exist, it could optionally behave like `set`.
     * @param key - The unique identifier for the cached image.
     * @param data - The updated image data as a Buffer.
     * @param ttl - New time-to-live for the cache entry in seconds.
     */
    update: (key: string, data: Buffer, ttl: number) => Promise<void>;

    /**
     * Delete a cached image.
     * @param key - The unique identifier for the cached image.
     */
    delete: (key: string) => Promise<void>;

    /**
     * Check whether a cached entry exists for a given key.
     * @param key - The unique identifier for the cached image.
     */

    has?: (key: string) => Promise<boolean>;
}
