import { CacheAdapter } from "./cache-adapter";

export interface CDNConfig {
    baseUrl: string; // CDN's base URL
    apiKey?: string; // Optional - API key for the CDN
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
    cacheDir: string; // Optional - cache directory for the file system adapter.
    defaultQuality: number; // default image quality... say 75?
    cdnConfig?: CDNConfig; // Optional CDN config
    deviceSizes: number[];
    imageSizes: number[];
    formats: string[];
    useEdgeCache: boolean;
    customLoader?: CustomLoader<TOptions>; // Optional custom loader function with generic options.
    logger?: (message: string, error?: unknown) => void;
    cacheAdapter?: CacheAdapter; // Optional - custom cache adapter
}
