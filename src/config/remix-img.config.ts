// import path from "path";
import type { RemixImageConfig } from "../types";
// import fs from "fs";

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
    formats: ["image/webp", "image/jpeg", "image/png"],

    logger: (msg, error) => {
        console.error(msg, error);
    },
};

let userConfig: Partial<RemixImageConfig> = {};

// // Check for both JS and TS config files.
// const possibleConfigFiles = [".remix-img.config.js", ".remix-img.config.ts"];

// for (const fileName of possibleConfigFiles) {
//     // try to load in config file (.remix-img.config.ts) in project root.
//     const configPath = path.join(process.cwd(), fileName);

//     if (fs.existsSync(configPath)) {
//         try {
//             userConfig = require(configPath);
//             console.log(`Loaded user config from ${configPath}`);
//             break;
//         } catch (error) {
//             console.error("Error loading .remix-img.config.ts", error);
//         }
//     }
// }

const config: RemixImageConfig = { ...defaultConfig, ...userConfig };

export default config;
