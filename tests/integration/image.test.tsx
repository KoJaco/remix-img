// tests/integration/remixImage.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Image from "../../src/components/image";
import defaultConfig from "../../src/config/remix-img.config";
import path from "path";
import fs from "fs";

// mock fetch
jest.mock("node-fetch", () => {
    return jest.fn((url: string) =>
        Promise.resolve({
            ok: true,
            // Return a valid jpg image as a buffer
            arrayBuffer: async () => {
                // Read the actual image file from the test-data directory.
                const filePath = path.join(__dirname, "data", "test-lg.jpg");
                const buffer = fs.readFileSync(filePath);
                // Convert Buffer to ArrayBuffer
                return buffer.buffer.slice(
                    buffer.byteOffset,
                    buffer.byteOffset + buffer.byteLength
                );
            },
        })
    );
});

// override deviceSizes temporarily.
const originalDeviceSizes = defaultConfig.deviceSizes;
defaultConfig.deviceSizes = [320, 480, 640];

// Example integration tests for the RemixImage component
describe("<Image />", () => {
    test("renders image with correct alt attribute and uses unoptimized src", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Example image"
                width={600}
                height={400}
                unoptimized={true} // so it simply returns the original src
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement).toBeInTheDocument();
        // JSDOM automatically resolves relative URLs -- use full url to compare
        expect(imgElement.src).toBe("https://example.com/image.jpg");
    });

    test("applies lazy loading by default", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Example image"
                width={600}
                height={400}
                unoptimized={true}
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement.loading).toBe("lazy");
    });

    test("uses overrideSrc if provided", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                overrideSrc="https://cdn.example.com/optimized.jpg"
                alt="Example image"
                width={600}
                height={400}
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement.src).toBe("https://cdn.example.com/optimized.jpg");
    });

    // testing todo with srcset/sizes.

    test("renders with srcset and sizes attributes for responsive images", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Responsive image"
                width={600}
                height={400}
            />
        );
        const img = screen.getByAltText("Responsive image") as HTMLImageElement;
        expect(img).toBeInTheDocument();

        // Check that a srcset attribute is generated
        expect(img).toHaveAttribute("srcset");
        const srcset = img.getAttribute("srcset") || "";
        // Expect srcset include all widths from overridden srcset
        expect(srcset).toContain("320w");
        expect(srcset).toContain("480w");
        expect(srcset).toContain("640w");

        // Check that sizes attribute is generated correctly
        // format e.g. (max-width: {width}px) 100vw, {width}px
        expect(img).toHaveAttribute("sizes", `(max-width: 600px) 100vw, 600px`);
    });

    test("does not generate srcset or sizes when fill mode is used", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Fill image"
                fill={true}
                width={600}
                height={400}
            />
        );
        const img = screen.getByAltText("Fill image") as HTMLImageElement;
        expect(img).toBeInTheDocument();

        // In fill mode, do not generate srcset or sizes.
        expect(img.getAttribute("srcset")).toBeNull();
        expect(img.getAttribute("sizes")).toBeNull();
    });

    test("fetches a candidate image from srcset", async () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Test image"
                width={600}
                height={400}
            />
        );
        const img = screen.getByAltText("Test image") as HTMLImageElement;
        const srcset = img.getAttribute("srcset");
        expect(srcset).toBeTruthy();
        if (srcset) {
            // Split the srcset string into candidate entries.
            const candidates = srcset.split(",").map((c) => c.trim());
            // Use the first candidate.
            const firstCandidateUrl = candidates[0].split(" ")[0];
            // Fetch the candidate URL (your mocked fetch will read the image file from tests/integration/data).
            const response = await fetch(firstCandidateUrl);
            expect(response.ok).toBe(true);
            const buffer = await response.arrayBuffer();
            // Verify that the returned image buffer is not empty.
            expect(buffer.byteLength).toBeGreaterThan(0);
        }
    });

    afterAll(() => {
        // Restore the original deviceSizes configuration.
        defaultConfig.deviceSizes = originalDeviceSizes;
    });
});
