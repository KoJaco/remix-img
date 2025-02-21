# Remix Img

An image optimization library for Remix inspired by Next.js’s `<Image />` component. I built this library because I needed a working solution that offers dynamic image optimization with server-side processing, responsive images, lazy loading, and caching similar to Next.js Image. I deploy my projects on environments like Linode (with persistent storage) and Vercel (serverless), so the default file-system caching solution works well for my needs. Since I’m already using something very similar to this in my projects, I decided to package it as an easy-to-use library.

-   Github Repo [remix-img](https://github.com/KoJaco/remix-img).

> **Note:** This library is currently in beta.

## Features

-   **Dynamic Image Optimization:**  
    Uses [Sharp](https://sharp.pixelplumbing.com/) for on-demand image processing (resizing, format conversion, and optimization).

-   **Caching & Revalidation:**

    -   Optimizes images on-demand and caches them using a file-system based adapter (default: `.cache/images`).
    -   Mimics Next.js’s caching strategy by storing each image variant in its own subdirectory with a unique filename and accompanying metadata.
    -   Supports smart cache headers (e.g. `x-remix-img-cache`: `MISS`, `STALE`, or `HIT`) and uses `Cache-Control` headers (`public, max-age=<TTL>, stale-while-revalidate=<timeout>`) so that downstream caches (or CDNs) can quickly serve images.
    -   Includes a config flag (`useEdgeCache`) that allows bypassing local caching to rely solely on CDN caching in serverless environments.

-   **Responsive Images:**  
    Automatically generates `srcset` and `sizes` attributes based on configured device sizes, ensuring the browser downloads the optimal image for the viewport.

-   **Native Lazy Loading & Priority:**  
    Leverages browser-native lazy loading with an IntersectionObserver fallback and supports eager loading for priority images.

-   **Fallback Placeholder & Blur-Up:**  
    Supports providing a custom placeholder image. (TODO: Implement auto-generated blurred placeholders.)

-   **Custom Loader Support:**  
    Allows you to plug in your own loader function to tailor image processing if desired.

-   **Pluggable Caching:**  
    Exposes a cache adapter interface so that you can replace the default file-system cache with a custom adapter (e.g., one that uses S3, Cloudflare KV, or a hybrid cache like `@next-boost/hybrid-disk-cache` for more robust production use).

## Installation

Install via npm:

```bash
npm install remix-img
```

## Quick Start

1. **Configure the Library**

    Modify your entry.server.tsx (project entry) in your remix project with the following:

    ```jsx
    import { updateConfig } from "remix-img";

    // override config
    updateConfig({
        allowedDomains: [
            "example.com",
            "cdn.example.com",
            "localhost",
            "mycustomdomain.com",
        ],
        cacheDir: process.env.REMIX_IMG_CACHE_DIR || ".cache/images",
        useEdgeCache: process.env.NODE_ENV === "production",
        defaultQuality: process.env.DEFAULT_QUALITY
            ? Number(process.env.DEFAULT_QUALITY)
            : 85,
    });

    // ... rest of your entry.server.ts code
    ```

    The library loads these overrides and merges them with the default configuration.

2. **Add Server-Side Image Optimization**

    In your Remix App, create a route that points to the image optimizer loader. For example, in `app/routes/optimized-image.ts`:

    ```ts
    // app/routes/optimized-image.ts
    import { loader as imageLoader } from "remix-img/dist/server/optimized-image";
    export { loader } from "remix-img/dist/server/optimized-image";
    ```

    This loader:

    - Validates the image URL and allowed domains.
    - Processes the image using Sharp (on a cache MISS or stale condition).
    - Leverages caching (or bypasses it if `useEdgeCache` is true) and sets smart Cache-Control headers.

3. **Use the Image Component**

    Import and use the `<RemixImage>` component in your Remix routes or components:

    ```tsx
    // app/routes/gallery.jsx
    import RemixImage from "remix-img/dist/components/remix-image";

    export default function Gallery() {
        return (
            <div>
                <h1>Gallery</h1>
                <RemixImage
                    src="https://example.com/my-image.jpg"
                    alt="A sample image"
                    width={800}
                    height={600}
                    placeholder="blur" // Use a custom placeholder URL (auto-blur TODO)
                    loading="lazy" // Defaults to lazy loading
                    onError={(e) => console.error("Image failed to load", e)}
                />
            </div>
        );
    }
    ```

    With the updated package entry point (see next section), you can import directly from `remix-img` (see below).

## API Reference

### `<RemixImage>` Component Props

-   **src**: `string`  
    The source URL of the image.

-   **alt**: `string`  
    Alt text for accessibility.

-   **width** & **height**: `number | string`  
    The desired dimensions of the image.

-   **placeholder**: `string` (optional)

    -   `"blur"`: Currently uses a custom URL placeholder (TODO: auto-generate a blurred placeholder).
    -   Or a custom placeholder image URL.

-   **loading**: `"lazy" | "eager"` (optional)  
    Browser-native lazy loading or immediate load for priority images.

-   **onError**: `(event: Event) => void` (optional)  
    Callback to handle load errors.

-   **customLoader**: `(src: string, width: number, quality?: number) => string` (optional)  
    Override the default URL builder.

-   **useEdgeCache**: _Configured via the config file_  
    When true, bypasses local caching to rely solely on CDN caching.

-   _Plus additional props for layout (fill, intrinsic, etc.) and style overrides._

### Server-Side Loader

The optimizer loader (in `server/optimized-image.ts`) handles:

-   Domain validation.
-   Processing the image using Sharp.
-   Caching via a pluggable cache adapter (default is a file-system adapter that stores each variant in its own subdirectory).
-   Setting smart Cache-Control headers (`public, max-age=<TTL>, stale-while-revalidate=<timeout>`) and a custom `x-remix-img-cache` header.

### Configuration Options

-   **minimumCacheTTL**: Number (seconds)
-   **staleWhileRevalidate**: Number (seconds)
-   **allowedDomains**: `string[]`
-   **cacheDir**: Directory path for caching (default: `.cache/images`)
-   **defaultQuality**: Number (0-100)
-   **deviceSizes & imageSizes**: `number[]` – Used for generating responsive `srcset`
-   **formats**: `string[]` – Supported output formats
-   **cdnConfig**: Optional CDN settings (not fully implemented yet)
-   **useEdgeCache**: Boolean – If true, bypasses local caching in favor of edge/CDN caching
-   **cacheAdapter**: Optionally, users can supply a custom adapter implementing the `CacheAdapter` interface.
-   **Custom Config File:**  
    Users can override defaults by creating a `.remix-img.config.json` file at the project root.

## Caching & Revalidation

-   **Caching Strategy:**  
    Mimics Next.js’s approach by storing each image variant in its own subdirectory.

    -   **MISS:** First-time processing and caching.
    -   **STALE:** Cached image is outdated; served immediately while revalidated in the background.
    -   **HIT:** Cached image is fresh.

-   **Smart Cache Headers:**  
    The response includes:

    -   `Cache-Control: public, max-age=<TTL>, stale-while-revalidate=<timeout>`
    -   `x-remix-img-cache`: Indicates the cache status.

-   **Pluggable Cache Adapter:**  
    The default is a file-system adapter (ideal for persistent environments like Linode/VMs). For serverless deployments (e.g. Vercel), a custom adapter can be provided to offload caching to an external service or rely on CDN caching (controlled via the `useEdgeCache` flag).

## Limitations & TODO

-   **Support Environment Variables:**
    At the moment users can override config using a .json file. I need to implement support for using environment variables for config options like `useEdgeCase`, `cdnConfig`, and `cacheDir`.
-   **Caching in Serverless:**  
    The default file-system caching is not ideal for serverless environments due to ephemeral storage. A more robust hybrid solution (similar to [@next-boost/hybrid-disk-cache](https://github.com/next-boost/hybrid-disk-cache)) would be needed for production-level serverless deployments.
-   **Custom Cache Adapter:**  
    Future improvements include allowing users to easily plug in external storage (like S3, Cloudflare KV, or Redis) for caching.
-   **Auto-Generated Blur Placeholder:**  
    Currently, the library accepts a placeholder URL. Future versions should auto-generate a blurred placeholder (e.g., a base64 data URL).
-   **Extended CDN Integration:**  
    Further enhancements may include better integration with edge networks and more configurable cache headers.
-   **Testing and Edge Cases:**
    I need to do further testing and identify bugs from edge cases before I can take the project out of beta.

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
4. **Link Locally**  
   Use `npm link` to link the library into your local Remix project:
    ```bash
    cd remix-img
    npm link
    # In your Remix project:
    npm link remix-img
    ```
5. **Run Tests**  
   Execute:
    ```bash
    npm test
    ```

### Running in a Remix Project

In your Remix app, create a route for the image optimizer (e.g., `app/routes/optimized-image.ts`) and import the loader from the library:

```ts
// app/routes/optimized-image.ts
import { loader } from "remix-img/dist/server/optimized-image";
export { loader };
```

Then, use the `<RemixImage>` component in your routes as described above.

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
