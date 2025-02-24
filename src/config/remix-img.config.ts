import type { RemixImageConfig } from "../types";

import { PartialRemixImageConfigSchema } from "./schema";

export const defaultConfig: RemixImageConfig = {
    minimumCacheTTL: 60, // 60 seconds TTL.
    staleWhileRevalidate: 30, // Allow 30 seconds of stale content.
    baseUrl: "",
    allowedDomains: [],
    cacheDir: "./cache/images", // Default file system cache directory.
    defaultQuality: 75, // Default quality of 75 (scale 0-100).
    // I've made the defaults inline with Tailwind CSS's breakpoints...
    // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, and 2xl: 1536px.
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64], // Image sizes for layout-specific images (thumbnails, icons, etc...)
    formats: ["image/webp", "image/jpeg", "image/png"], // in Mime type
    cdnConfig: {
        baseUrl: "",
        apiKey: undefined,
    },
    useEdgeCache: false,
    logger: (msg, error) => {
        console.error(msg, error);
    },
    cacheAdapter: undefined, // default will be created if undefined
};

let config: RemixImageConfig = { ...defaultConfig };

export function updateConfig(newConfig: Partial<RemixImageConfig>): void {
    // validate incoming config against schema
    const result = PartialRemixImageConfigSchema.safeParse(newConfig);

    if (!result.success) {
        console.error("Invalid configuration provided:", result.error.format());
        return;
    }
    // Update in place
    Object.assign(config, result.data);
    // console.log("Remix Image Optimizer config update:", config);
}

export function getConfig(): RemixImageConfig {
    return config;
}

export default config;
