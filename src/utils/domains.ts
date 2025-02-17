// Validates whether the domain is in config.allowedDomains
export function isAllowedDomain(
    src: string,
    allowedDomains: string[]
): boolean {
    try {
        const url = new URL(src);
        return allowedDomains.includes(url.hostname);
    } catch {
        return false;
    }
}
