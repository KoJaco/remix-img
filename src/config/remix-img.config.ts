import type { CacheAdapter, CDNConfig, CustomLoader } from "../types";

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
