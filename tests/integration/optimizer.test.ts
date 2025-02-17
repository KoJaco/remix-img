import path from "path";
import fs from "fs";
import { loader } from "../../src/server/optimizer";

/**
 * Integration test should:
 *
 * 1. Test missing or invalid parameters (returning 400).
 * 2. Test disallowed domains (returning 403).
 * 3. Process with proper headers and a non-empty image buffer.
 *
 * TODO: Edgies
 * 1. Error is fetching/processing.
 * 2. Incomplete or lacking transformation options.
 * 3. Test Cache return on multiple hits.
 * 4. Test cache "STALE" header is set and reval is triggered.
 * 5. Verify different f values for Content-Type matches expected MIME type.
 * 6. (ehhh) Test errors are logged appropriately with a custom logger
 */

// helper to create a mock Request
function createMockRequest(query: string): Request {
    return new Request(`http://localhost/optimized-image?${query}`);
}

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

describe("Loader Function Integration", () => {
    test("returns 400 if src is missing", async () => {
        const req = createMockRequest("w=800&h=600&q=80");
        const response = await loader({
            request: req,
            params: {},
            context: {},
        });
        expect(response.status).toBe(400);
        const text = await response.text();
        expect(text).toMatch(/Missing image source/);
    });

    test("returns 403 for disallowed domain", async () => {
        // Assuming config.allowedDomains does not include "disallowed.com"
        const req = createMockRequest(
            "src=https://disallowed.com/image.jpg&w=800"
        );
        const response = await loader({
            request: req,
            params: {},
            context: {},
        });
        expect(response.status).toBe(403);
        const text = await response.text();
        expect(text).toMatch(/Domain not allowed/);
    });

    test("processes an image and returns headers", async () => {
        // assume "allowed.com" is in allowedDomains.
        const req = createMockRequest(
            "src=https://allowed.com/image.jpg&w=800&h=600&q=80&f=webp"
        );
        const response = await loader({
            request: req,
            params: {},
            context: {},
        });

        // Expect a successful response
        expect(response.status).toBe(200);

        // Check the headers
        const contentType = response.headers.get("Content-Type");
        expect(contentType).toBe("image/webp");

        // Check the custom cache header exists and has one of the valid values.
        const cacheHeader = response.headers.get("x-remix-img-cache");
        expect(["HIT", "STALE", "MISS"]).toContain(cacheHeader);

        // Optionally, you can check that the response body is a Buffer of a certain length.
        const buffer = await response.arrayBuffer();
        expect(buffer.byteLength).toBeGreaterThan(0);
    });
});
