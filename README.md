# Remix Image Optimizer

A robust image optimization library for Remix, inspired by Next.js’s `<Image />` component. This library provides dynamic image optimization with server-side caching, native lazy loading, responsive image support, and customizable loaders. It’s designed to seamlessly integrate into your Remix app while offering full control over caching and revalidation strategies.

-   Github [remix-img](https://github.com/KoJaco/remix-img)

## Features

-   **Dynamic Image Optimization:** Uses [Sharp](https://sharp.pixelplumbing.com/) for server-side image processing.
-   **Caching & Revalidation:**
    -   Optimizes images on-demand and caches them (default: `<distDir>/cache/images`).
    -   Supports `x-remix-img-cache` header values: `MISS`, `STALE`, and `HIT`.
    -   Implements stale-while-revalidate: serves stale images immediately while updating in the background.
-   **Responsive Images:** Automatically generates `srcset` and `sizes` attributes based on configured device and image sizes.
-   **Native Lazy Loading & Priority:** Leverages browser-native lazy loading with support for eager loading (`priority` prop).
-   **Fallback Placeholder & Blur-Up:**
    -   Optional blurred placeholder (data URL) for a smooth image loading experience.
    -   Custom fallback placeholder in case of image load errors.
-   **Custom Loader Support:** Allows you to plug in your own loader function to tailor image processing.
-   **CDN Integration:** Configure your own CDN (via environment variables or a custom adapter) if needed.
-   **Error Handling:** Built-in error callbacks and support for fallback images.

## Installation

Install via npm:

```bash
npm install remix-img
```

## Quick Start

1. Configure the library

Create (or modify) the config file `remix-img.config.ts` to specify your caching, allowed domains, and CDN settings.

```jsx
// remix-img.config.ts
import { RemixImgConfig } from "remix-img";

const config: RemixImgConfig = {
    minimumCacheTTL: 60, // Cache TTL in seconds
    allowedDomains: ["example.com", "cdn.example.com"],
    deviceSizes: [640, 750, 828],
    imageSizes: [16, 32, 48, 64],
    formats: ["image/webp", "image/jpeg", "image/png"],
    cdnConfig: {
        baseUrl: process.env.CDN_BASE_URL || "",
        apiKey: process.env.CDN_API_KEY || undefined,
    },
};

export default config;
```

2. Add Server-Side image optimization

In your Remix App, create a route that points to the image optimization loader. E.g., in `app/routes/optimized-image.$imageUrl.ts`:

```bash
import {loader as imageLoader} from 'remix-img/server/optimizer';
const loader = imageLoader;
```

This loader will:

-   Check your custom (default is the file system, specify a custom adapter if you need for serverless environments, say).
-   Process the image with Sharp on a cache MISS or when the cached image is STALE.
-   Serve the image with proper headers (e.g., `x-remix-img-cache` and `Cache-Control`).

3. Use the Image component

Import and use the `<Image />` component in your Remix routes or components:

```jsx
// app/routes/gallery.jsx
import RemixImage from "remix-img/components/RemixImage";

export default function Gallery() {
    return (
        <div>
            <RemixImage
                src="https://example.com/my-image.jpg"
                alt="A sample image"
                width={800}
                height={600}
                placeholder="blur" // Use a blurred data URL placeholder
                loading="lazy" // Browser-native lazy loading; use "eager" for priority images
                onError={(e) => console.error("Image failed to load", e)}
                // Optionally, pass a customLoader function to override default behavior
            />
        </div>
    );
}
```

## API Reference

### `<Image />` Component Props

-   **src**: `string`  
    The source URL of the image.
-   **alt**: `string`  
    Alt text for accessibility.
-   **width**: `number`  
    Desired image width.
-   **height**: `number`  
    Desired image height.
-   **placeholder**: `string` (optional)
    -   `"blur"`: Use a blurred, data URL-based placeholder.
    -   Custom data URL string for a custom placeholder.
-   **loading**: `string` (optional)
    -   `"lazy"` (default): Browser-native lazy loading.
    -   `"eager"`: Loads the image immediately (useful for above-the-fold images).
-   **onError**: `(event: Event) => void` (optional)  
    Callback to handle image load errors.
-   **customLoader**: `(src: string, options?: any) => Promise<string>` (optional)  
    Custom function to override default image processing logic.

### Server-Side Loader

The server-side image optimizer (in `server/optimizer.ts`) handles:

-   Checking the cache for an optimized image.
-   Processing the image using Sharp when necessary.
-   Setting headers:
    -   **`x-remix-img-cache`**: Indicates cache status (`MISS`, `STALE`, or `HIT`).
    -   **`Cache-Control`**: Instructs browsers/CDNs (e.g., `public, max-age=60, stale-while-revalidate=30`).

### Configuration Options

The configuration file (`remix-img.config.ts`) lets you set:

-   **minimumCacheTTL**: Minimum cache time-to-live (in seconds).
-   **allowedDomains**: An array of domains allowed for optimization.
-   **deviceSizes & imageSizes**: Arrays to control responsive image generation.
-   **formats**: Supported output formats (e.g., `['image/webp', 'image/jpeg']`).
-   **cdnConfig**: Optional settings for CDN integration (base URL, API key).
-   **cacheAdapter**: Optionally, provide a custom cache adapter for environments like serverless or distributed systems.

## Caching & Revalidation

This library implements a caching strategy similar to Next.js:

-   **Cache Status:**
    -   `MISS`: First-time request; image is processed and cached.
    -   `STALE`: Cached image is expired; served immediately while revalidation occurs in the background.
    -   `HIT`: Cached image is fresh.
-   **Headers:**
    -   **`x-remix-img-cache`**: Indicates the cache status.
    -   **`Cache-Control`**: Configured as `public, max-age=<TTL>, stale-while-revalidate=<timeout>` to instruct downstream caches.

## Custom Loader & Error Handling

-   **Custom Loader:**  
    If the default image processing doesn’t suit your needs, supply a custom loader via the `customLoader` prop. Your custom loader should accept the image URL (and optional transformation options) and return a URL or data representing the optimized image.
-   **Error Handling:**  
    Use the `onError` prop to manage any issues during image load — e.g., switching to an alternative source or logging errors.

## Development

### Local Development

1. **Clone the Repository**  
   Clone the repository to your local machine.
2. **Install Dependencies**  
   Run:

    ```bash
    npm install
    ```

3. **Build the Library**  
   Compile the TypeScript:

    ```bash
    npm run build
    ```

4. **Test Locally**  
   Use `npm link` to link the library into your local Remix project:
    ```bash
    cd remix-img
    npm link
    # In your Remix project:
    npm link remix-img
    ```

### Running Tests

Tests ensure the core functionality works as expected. Run tests with:

```bash
npm test
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes.
4. Push to your fork and open a Pull Request.

Please ensure your code adheres to best practices and includes tests for new features or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

-   Inspired by Next.js’s `<Image />` component.
-   Uses [Sharp](https://sharp.pixelplumbing.com/) for efficient image processing.
-   Thanks to the Remix community for continued inspiration and support.
