export function parsePositiveInt(
    value: string | null,
    paramName: string
): number | undefined {
    if (value === null) return undefined;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
        throw new Error(`Invalid value for ${paramName}: ${value}`);
    }
    return parsed;
}

export function getImageContentType(format: string, src?: string): string {
    if (format !== "auto") {
        switch (format) {
            case "webp":
                return "image/webp";
            case "png":
                return "image/png";
            case "jpeg":
            case "jpg":
                return "image/jpeg";
            default:
                return "application/octet-stream";
        }
    }
    if (src) {
        const ext = src.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "png":
                return "image/png";
            case "webp":
                return "image/webp";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            default:
                return "image/jpeg";
        }
    }
    return "image/jpeg";
}
