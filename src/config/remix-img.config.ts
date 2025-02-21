import path from "path";
import type { RemixImageConfig } from "../types";
import fs from "fs";
import { PartialRemixImageConfigSchema } from "./schema";

// TODO: Support environment variables for config options.

export const defaultConfig: RemixImageConfig = {
    minimumCacheTTL: 60, // 60 seconds TTL.
    staleWhileRevalidate: 30, // Allow 30 seconds of stale content.
    allowedDomains: ["cdn.example.com", "localhost", "example.com"],
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

let userConfig: Partial<RemixImageConfig> = {};
const configPath = path.join(process.cwd(), ".remix-img.config.json");

if (fs.existsSync(configPath)) {
    try {
        const raw = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw);

        // validate against zod schema
        const validated = PartialRemixImageConfigSchema.safeParse(parsed);

        if (validated.success) {
            userConfig = validated.data;
            console.log(`Loaded user config from ${configPath}`);
        } else {
            console.error(
                "User config validation errors: ",
                validated.error.format()
            );
        }
    } catch (error) {
        console.error(`Error loading config from ${configPath}:`, error);
    }
}

// Merge default config with validated user config, defaults to default.
const config: RemixImageConfig = { ...defaultConfig, ...userConfig };

export default config;
