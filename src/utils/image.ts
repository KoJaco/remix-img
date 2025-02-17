import { ImageProps } from "../types";

/**
 * Builds the URL to the optimized image endpoint.
 * If unoptimized is true, simply returns the original src.
 * If a custom loader is provided, uses that.
 * Otherwise, constructs a URL with query parameters.
 */

export function buildOptimizedImageUrl(props: ImageProps): string {
    if (props.unoptimized) {
        return props.src;
    }

    // 1. If a custom loader is provided, convert width/quality to numbers.

    if (props.loader) {
        const w =
            typeof props.width === "number"
                ? props.width
                : props.width
                ? parseInt(props.width as string, 10)
                : 800;
        const q =
            typeof props.quality === "number"
                ? props.quality
                : props.quality
                ? parseInt(props.quality as string, 10)
                : 75;
        return props.loader(props.src, w, q);
    }

    // 2. Build URL for our /optimized-image endpoint.
    const url = new URL("/optimized-image", window.location.origin);
    url.searchParams.set("src", props.src);

    // 3. If fill/layout mode is not used, include width/height.
    if (!props.fill && !(props.layout === "fill")) {
        if (props.width) {
            const w =
                typeof props.width === "number"
                    ? props.width
                    : parseInt(props.width as string, 10);
            if (!isNaN(w)) url.searchParams.set("w", String(w));
        }
        if (props.height) {
            const h =
                typeof props.height === "number"
                    ? props.height
                    : parseInt(props.height as string, 10);
            if (!isNaN(h)) url.searchParams.set("h", String(h));
        }
    }

    // 4. Quality conversion
    if (props.quality) {
        const q =
            typeof props.quality === "number"
                ? props.quality
                : parseInt(props.quality as string, 10);
        if (!isNaN(q)) url.searchParams.set("q", String(q));
    }

    // 5. For now, we always pass "auto" as the output format.
    url.searchParams.set("f", "auto");
    return url.toString();
}
