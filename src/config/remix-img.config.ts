export interface CDNConfig {
    baseUrl: string; // Your CDN's base URL
    apiKey?: string; // Optional - API key for the CDN
}

export interface CacheAdapter {
    /**
     * Retrieve a cached image using a unique cache key.
     * @param key - The unique identifier for the cached image.
     * @returns Promise that resolves with the image Buffer or null if not found.
     */
    get: (key: string) => Promise<Buffer | null>;

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
}

// Generic type for custom loader options, defaults to unknown... should I just use any? At least allow users to define their own custom type for loader options.
export type CustomLoader<TOptions = unknown> = (
    src: string,
    options?: TOptions
) => Promise<string>;

export interface RemixImageConfig<TOptions = unknown> {
    minimumCacheTTL: number; // should be in seconds
    staleWhileRevalidate: number; // duration to serve stale images in seconds.
    allowedDomains: string[];
    cacheDir?: string; // Optional - cache directory for the file system adapter.
    defaultQuality: number; // default image quality... say 75?
    cacheAdapter?: CacheAdapter; // Optional - custom cache adapter
    cdnConfig?: CDNConfig; // Optional CDN config
    deviceSizes: number[];
    imageSizes: number[];
    formats: string[];
    customLoader?: CustomLoader<TOptions>; // Optional custom loader function with generic options.
}

const defaultConfig: RemixImageConfig = {
    minimumCacheTTL: 60, // 60 seconds TTL.
    staleWhileRevalidate: 30, // Allow 30 seconds of stale content.
    allowedDomains: ["example.com", "cdn.example.com"],
    cacheDir: "./cache/images", // Default file system cache directory.
    defaultQuality: 75, // Default quality of 75 (scale 0-100).
    // I've made the defaults inline with Tailwind CSS's breakpoints...
    // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, and 2xl: 1536px.
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64], // Image sizes for layout-specific images (thumbnails, icons, etc...)
    formats: ["image/webp", "image/jpeg", "image/png"],
    cdnConfig: {
        baseUrl: process.env.CDN_BASE_URL || "",
        apiKey: process.env.CDN_API_KEY || undefined,
    },
};

export default defaultConfig;
