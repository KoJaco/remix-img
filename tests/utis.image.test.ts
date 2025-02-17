/**
 * @jest-environment jsdom
 */

/**
 *
 * TODO: Edge cases
 * 1. Test that builder correctly converts width/quality/height when they are strings
 * 2. Test custom loader behaviour
 * 3. Verify priority loading behaviour
 * 4. Ensure custom loader's output is used as the img source
 * 5. Test lazy loading fallback? -- maybe mock IntersectionObserver to ensure that observed intersection = load in?
 * 6. Test placeholder and blur effect is used as src until main image loads.
 * 7. Test all event callbacks (onLoadingComplete && onError)
 *
 *
 */

import { buildOptimizedImageUrl } from "../src/utils";

describe("buildOptimizedImageUrl", () => {
    // Check window.location.origin is defined (JSDOM usually sets it I think?)
    const originalOrigin = window.location.origin;

    test("returns original src if unoptimized is true", () => {
        const props = {
            src: "https://example.com/image.jpg",
            alt: "Test image",
            unoptimized: true,
            width: 500,
            height: 300,
        };
        const url = buildOptimizedImageUrl(props);
        expect(url).toBe(props.src);
    });

    test("builds optimized URL with query parameters", () => {
        const props = {
            src: "https://example.com/image.jpg",
            alt: "Test image",
            width: 500,
            height: 300,
            quality: 80,
            unoptimized: false,
        };
        const url = new URL(buildOptimizedImageUrl(props));
        expect(url.pathname).toBe("/optimized-image");
        expect(url.searchParams.get("src")).toBe(props.src);
        expect(url.searchParams.get("w")).toBe("500");
        expect(url.searchParams.get("h")).toBe("300");
        expect(url.searchParams.get("q")).toBe("80");
        expect(url.searchParams.get("f")).toBe("auto");
    });

    test("uses custom loader if provided", () => {
        const customLoader = jest.fn(
            (src: string, width: number, quality?: number) => {
                return `https://cdn.example.com/${width}/${quality}/${src}`;
            }
        );
        const props = {
            src: "image.jpg",
            alt: "Test image",
            width: 400,
            quality: 90,
            loader: customLoader,
        };
        const url = buildOptimizedImageUrl(props);
        expect(customLoader).toHaveBeenCalledWith("image.jpg", 400, 90);
        expect(url).toBe(`https://cdn.example.com/400/90/image.jpg`);
    });
});
