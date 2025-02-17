import { parsePositiveInt, getImageContentType } from "../src/utils";

describe("parsePositiveInt", () => {
    test("returns undefined when value is null", () => {
        expect(parsePositiveInt(null, "w")).toBeUndefined();
    });

    test("parses a valid positive integer", () => {
        expect(parsePositiveInt("800", "w")).toBe(800);
    });

    test("throws an error for a non-numeric value", () => {
        expect(() => parsePositiveInt("not-a-number", "w")).toThrow(
            "Invalid value for w: not-a-number"
        );
    });

    test("throws an error for a non-positive number", () => {
        expect(() => parsePositiveInt("-50", "w")).toThrow(
            "Invalid value for w: -50"
        );
    });
});

describe("getContentType", () => {
    test("returns correct MIME type for webp", () => {
        expect(getImageContentType("webp")).toBe("image/webp");
    });
    test("returns correct MIME type for png", () => {
        expect(getImageContentType("png")).toBe("image/png");
    });
    test("returns correct MIME type for jpeg", () => {
        expect(getImageContentType("jpeg")).toBe("image/jpeg");
    });
    test("returns default MIME type for unknown format", () => {
        expect(getImageContentType("bmp")).toBe("application/octet-stream");
    });
});
