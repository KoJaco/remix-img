import { promises as fs } from "fs";
import { FSCacheAdapter } from "../src/utils/fs-cache-adapter";

const TEST_CACHE_DIR = "./tests/tmp-cache";

describe("FSCacheAdapter", () => {
    let cacheAdapter: FSCacheAdapter;
    const testKey = "test-key";
    const testData = Buffer.from("test data");
    const ttl = 1; // 1 second TTL

    beforeAll(async () => {
        cacheAdapter = new FSCacheAdapter(TEST_CACHE_DIR);
    });

    afterAll(async () => {
        // Clean up test cache directory after all tests are done...
        await fs.rm(TEST_CACHE_DIR, { recursive: true });
    });

    test("should set and get a cache entry", async () => {
        await cacheAdapter.set(testKey, testData, ttl);
        const entry = await cacheAdapter.get(testKey);
        expect(entry).not.toBeNull();
        if (entry) {
            expect(entry.data.toString()).toEqual(testData.toString());
            expect(entry.expiration).toBeGreaterThan(Date.now());
        }
    });

    test("should update a cache entry", async () => {
        const newData = Buffer.from("new data");
        await cacheAdapter.update(testKey, newData, ttl);
        const entry = await cacheAdapter.get(testKey);
        expect(entry).not.toBeNull();
        if (entry) {
            expect(entry.data.toString()).toEqual(newData.toString());
        }
    });

    test("should delete a cache entry", async () => {
        await cacheAdapter.delete(testKey);
        const entry = await cacheAdapter.get(testKey);
        expect(entry).toBeNull();
    });
});
