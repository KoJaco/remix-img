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
import { updateConfig } from "../src/config/remix-img.config";
import { ImageProps } from "../src/types";
import {
    buildOptimizedImageUrl,
    buildOptimizedImageUrlForWidth,
    generateSrcSet,
} from "../src/utils";

const defaultProps: ImageProps = {
    src: "https://example.com/image.jpg",
    alt: "Example Image",
    width: 600,
    height: 400,
    quality: 80,
};

// Jest/jsdom falling back to origin without the port.

Object.defineProperty(window, "location", {
    value: { origin: "http://localhost:5173" },
    writable: true,
});

describe("Image Utils", () => {
    describe("buildOptimizedImageUrl", () => {
        it("returns original src when unoptimized is true", () => {
            const props: ImageProps = {
                ...defaultProps,
                unoptimized: true,
            };
            const url = buildOptimizedImageUrl(props);
            expect(url).toBe(props.src);
        });

        it("builds a URL with query parameters correctly", () => {
            const props: ImageProps = {
                ...defaultProps,
                unoptimized: false,
            };
            const urlString = buildOptimizedImageUrl(props);
            const url = new URL(urlString);
            expect(url.pathname).toBe("/optimized-image");
            expect(url.searchParams.get("src")).toBe(defaultProps.src);
            expect(url.searchParams.get("w")).toBe("600");
            expect(url.searchParams.get("h")).toBe("400");
            expect(url.searchParams.get("q")).toBe("80");
            expect(url.searchParams.get("f")).toBe("auto");
        });

        it("uses a custom loader if provided", () => {
            const customLoader = jest.fn(
                (src: string, width: number, quality?: number) => {
                    return `https://cdn.example.com/${width}/${quality}/${src}`;
                }
            );
            const props: ImageProps = {
                ...defaultProps,
                loader: customLoader,
            };
            const url = buildOptimizedImageUrl(props);
            expect(customLoader).toHaveBeenCalledWith(
                defaultProps.src,
                600,
                80
            );
            expect(url).toBe(
                `https://cdn.example.com/600/80/${defaultProps.src}`
            );
        });
    });

    describe("buildOptimizedImageUrlForWidth", () => {
        it("builds a URL for a given target width", () => {
            const targetWidth = 320;
            const urlString = buildOptimizedImageUrlForWidth(
                defaultProps,
                targetWidth
            );
            const url = new URL(urlString);
            expect(url.searchParams.get("src")).toBe(defaultProps.src);
            expect(url.searchParams.get("w")).toBe(String(targetWidth));
            // Height and quality should come from defaultProps.
            expect(url.searchParams.get("h")).toBe("400");
            expect(url.searchParams.get("q")).toBe("80");
            expect(url.searchParams.get("f")).toBe("auto");
        });
    });

    describe("generateSrcSet", () => {
        it("generates a srcset string with candidate widths", () => {
            updateConfig({ deviceSizes: [320, 480, 640] });

            const srcset = generateSrcSet(defaultProps);
            const candidates = srcset
                .split(",")
                .map((candidate) => candidate.trim());
            expect(candidates.length).toBe(3);

            candidates.forEach((candidate, index) => {
                // Each candidate should be in the format: <url> <width>w
                const [urlPart, descriptor] = candidate.split(" ");
                expect(descriptor).toBe(`${[320, 480, 640][index]}w`);
                const url = new URL(urlPart);
                expect(url.searchParams.get("w")).toBe(
                    String([320, 480, 640][index])
                );
            });

            // Restore original device sizes.
            updateConfig({ deviceSizes: [640, 768, 1024, 1280, 1536] });
        });
    });

    describe("generateSrcSet with baseUrl", () => {
        it("Should generate srcset URLs using the provided baseUrl", () => {
            const base = "http://localhost:5173";

            updateConfig({ baseUrl: base });

            const props: ImageProps = {
                src: "https://someid.supabase.co/storage/v1/object/public/dir/subdir/img.webp",
                alt: "Test image",
                width: 1600,
                height: 900,
                outputFormat: "auto",
            };

            const srcset = generateSrcSet(props);

            // all candidate urls in the srcset should start with the provided baseUrl
            srcset.split(",").forEach((candidate) => {
                expect(candidate.trim().startsWith(base)).toBe(true);
            });

            updateConfig({ baseUrl: "" });
        });
    });
});
