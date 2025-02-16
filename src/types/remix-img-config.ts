export interface CDNConfig {
    baseUrl: string; // Your CDN's base URL
    apiKey?: string; // Optional - API key for the CDN
}

// Generic type for custom loader options, defaults to unknown... should I just use any? At least allow users to define their own custom type for loader options.
export type CustomLoader<TOptions = unknown> = (
    src: string,
    options?: TOptions
) => Promise<string>;
