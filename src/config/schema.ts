import { z } from "zod";

export const RemixImageConfigSchema = z.object({
    minimumCacheTTL: z.number().min(0).optional(),
    staleWhileRevalidate: z.number().min(0).optional(),
    baseUrl: z.string().optional(),
    allowedDomains: z.array(z.string()).optional(),
    cacheDir: z.string().optional(),
    defaultQuality: z.number().min(0).max(100).optional(),
    deviceSizes: z.array(z.number()).optional(),
    imageSizes: z.array(z.number()).optional(),
    formats: z.array(z.string()).optional(),
    cdnConfig: z
        .object({
            baseUrl: z.string(),
            apiKey: z.string().optional(),
        })
        .optional(),
    useEdgeCache: z.boolean().optional(),
    logger: z.any().optional(), // logger is a function, but we don't need to validate its signature strictly.
});

// For a partial config (user can override only some properties)
export const PartialRemixImageConfigSchema = RemixImageConfigSchema.partial();
