// Client exports: these are safe for browser use.
export { default as Image } from "./client";

// Configuration exports (these are shared across client and server)
export {
    updateConfig,
    getConfig,
    defaultConfig,
} from "./config/remix-img.config";
export * from "./types";

// Server exports
export { loader as optimizedImageLoader } from "./server/optimizer.server";
