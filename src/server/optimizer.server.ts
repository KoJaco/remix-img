import { LoaderFunctionArgs } from "@remix-run/node";
import fetch from "node-fetch"; // used instead of fetch (Node 18+)
import sharp from "sharp";
import config from "../config/remix-img.config";
import type { CacheEntry } from "../types";
import {
    generateCacheKey,
    getImageContentType,
    parsePositiveInt,
} from "../utils";
import { FSCacheAdapter } from "./fs-cache-adapter.server";

// Instantiate default cache adapter
const cacheAdapter =
    config.cacheAdapter ||
    new FSCacheAdapter(config.cacheDir || "./cache/images");

// Function to process the image using Sharp.
async function processImage(
    src: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        outputFormat?: string;
    }
): Promise<Buffer> {
    // TODO: Should outputFormat be validated? Is it necessary initially? Need some work on adjusting the quality if the outputFormat is undefined or 'auto'...

    // 1. Fetch original image
    const res = await fetch(src);

    if (!res.ok) {
        throw new Error(`Failed to fetch image: ${src}`);
    }

    // 2. If ok, parse to buffer | this can fail but it should be alright if res.ok...?
    let inputBuffer: Buffer;

    try {
        inputBuffer = Buffer.from(await res.arrayBuffer());
    } catch (error) {
        throw new Error(`Error parsing image data: ${error}`);
    }

    // 3. set up tranformer | Sharp will throw errors if there is an issue with the input data or transform chain... thrown when calling .toBuffer()
    let transformer = sharp(inputBuffer);

    // 4. apply resizing
    if (options.width || options.height) {
        transformer = transformer.resize(options.width, options.height, {
            fit: "inside",
        });
    }

    // 5. determine outputFormat... if it is provided and not "auto", convert to that format. Otherwise, preserve original.
    if (options.outputFormat && options.outputFormat !== "auto") {
        transformer = transformer.toFormat(
            options.outputFormat as keyof sharp.FormatEnum,
            {
                quality: options.quality || config.defaultQuality,
            }
        );
    } else if (options.quality) {
        // if outputFormat is auto or undefined yet quality is specified, detect original format and re-encode.
        const metadata = await transformer.metadata();
        const originalFormat = metadata.format;
        if (originalFormat) {
            // Re-encode using the original format and provided quality.
            switch (originalFormat) {
                case "jpeg":
                    transformer = transformer.jpeg({
                        quality: options.quality,
                    });
                    break;
                case "png":
                    transformer = transformer.png({ quality: options.quality });
                    break;
                case "webp":
                    transformer = transformer.webp({
                        quality: options.quality,
                    });
                    break;
                default:
                    // TODO: Add config option for outputFormat fallback maybe?
                    transformer = transformer.webp({
                        quality: options.quality,
                    });
                    break;
            }
        }
    }

    // 6. Return Buffer
    return transformer.toBuffer();
}

// Asynchronously trigger revalidation (background update of cache)
async function revalidateImage(
    cacheKey: string,
    src: string,
    options: Record<string, any>,
    ttl: number
) {
    try {
        const buffer = await processImage(src, options);
        await cacheAdapter.set(cacheKey, buffer, ttl);
    } catch (error) {
        if (config.logger) {
            config.logger("Revalidation failed: ", error);
        } else {
            console.error("Revalidation failed:", error);
        }
    }
}

// loader function for Remix Route
export async function loader({ request }: LoaderFunctionArgs) {
    // 1. Expecting the image URL as a query parameter: ?src=<url>
    const url = new URL(request.url);
    const src = url.searchParams.get("src");

    // 2. Initial checks
    if (!src) {
        return new Response("Missing image source", { status: 400 });
    }

    // Resolve the source URL using the request's URL as base
    const resolvedSrc = new URL(src, request.url);

    if (!config.allowedDomains.includes(resolvedSrc.hostname)) {
        return new Response(`Domain '${resolvedSrc.hostname}' not allowed`, {
            status: 403,
        });
    }

    // 3. Define image attributes and try parsing into transformationOptions
    let width: number | undefined,
        height: number | undefined,
        quality: number | undefined,
        outputFormat: string;

    try {
        width = parsePositiveInt(url.searchParams.get("w"), "w"); // ?w=600
        height = parsePositiveInt(url.searchParams.get("h"), "h"); // ?h=600
        quality = parsePositiveInt(url.searchParams.get("q"), "q"); // ?q=75
        // parse output format but default to "auto"
        outputFormat = url.searchParams.get("f") || "auto"; // ?f=webp
        const validFormats = ["auto", "webp", "png", "jpeg", "jpg"];
        if (!validFormats.includes(outputFormat)) {
            throw new Error(`Invalid output format: ${outputFormat}`);
        }
    } catch (error: any) {
        if (config.logger) {
            config.logger(
                `Invalid query parameter: ${error?.message || error}`
            );
        } else {
            console.error(
                `Invalid query parameter: ${error?.message || error}`
            );
        }
        return new Response(
            `Invalid query parameter: ${error?.message || error}`,
            { status: 400 }
        );
    }

    const transformationOptions = { width, height, quality, outputFormat };

    // 4. Generate a cache key for this image request
    const cacheKey = generateCacheKey(
        resolvedSrc.toString(),
        transformationOptions
    );

    // 5. Define TTL and stale duration from config
    const ttl = config.minimumCacheTTL;
    const staleWhileRevalidate = config.staleWhileRevalidate;

    // Caching stuff, follow Next/image behaviour: https://nextjs.org/docs/pages/api-reference/components/image#caching-behavior

    // 6. determine edge caching or not
    let cacheEntry: CacheEntry | null = null;

    if (!config.useEdgeCache) {
        // If we're not falling back on edge caching, use our FSCacheAdapter.
        const cacheAdapter = new FSCacheAdapter(config.cacheDir);
        cacheEntry = await cacheAdapter.get(cacheKey);
        if (cacheEntry && cacheEntry.expiration <= Date.now()) {
            // cache is stale, trigger reval in the background
            revalidateImage(
                cacheKey,
                resolvedSrc.toString(),
                transformationOptions,
                ttl
            ).catch(console.error);
        }
    }

    let imageBuffer: Buffer;

    if (!cacheEntry) {
        try {
            imageBuffer = await processImage(
                resolvedSrc.toString(),
                transformationOptions
            );

            if (!config.useEdgeCache) {
                const cacheAdapter = new FSCacheAdapter(config.cacheDir);
                await cacheAdapter.set(cacheKey, imageBuffer, ttl, {
                    format:
                        transformationOptions.outputFormat !== "auto"
                            ? transformationOptions.outputFormat
                            : "jpeg",
                });
            }
        } catch (error) {
            return new Response(`Error processing image: ${error}`, {
                status: 500,
            });
        }
    } else {
        imageBuffer = cacheEntry.data;
    }

    let finalFormat = "jpeg";

    if (
        transformationOptions.outputFormat &&
        transformationOptions.outputFormat !== "auto"
    ) {
        finalFormat = transformationOptions.outputFormat;
    }

    const headers = new Headers();
    headers.set(
        "Content-Type",
        getImageContentType(finalFormat, resolvedSrc.toString())
    );
    headers.set(
        "Cache-Control",
        `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
    );
    headers.set(
        "x-remix-img-cache",
        cacheEntry
            ? cacheEntry.expiration > Date.now()
                ? "HIT"
                : "STALE"
            : "MISS"
    );

    return new Response(imageBuffer, { headers });
}
