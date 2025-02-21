// src/components/remix-image.tsx
import React from "react";

export interface ImageProps
    extends Omit<
        React.DetailedHTMLProps<
            React.ImgHTMLAttributes<HTMLImageElement>,
            HTMLImageElement
        >,
        "src" | "alt" | "width" | "height" | "loading"
    > {
    /**
     * The source URL of the image.
     */
    src: string;
    /**
     * Alt text for accessibility.
     */
    alt: string;
    /**
     * Desired image width. Can be a number or a string literal.
     */
    width?: number | `${number}`;
    /**
     * Desired image height. Can be a number or a string literal.
     */
    height?: number | `${number}`;
    /**
     * If true, the image fills its container (overrides width/height).
     */
    fill?: boolean;
    /**
     * Allows overriding the generated sizes attribute.
     */
    sizes?: string;
    /**
     * Custom loader function to override the default URL builder.
     */
    loader?: (src: string, width: number, quality?: number) => string;
    /**
     * Desired quality of the optimized image (0–100).
     */
    quality?: number | `${number}`;
    /**
     * Specifies the output format: "auto" preserves the original, otherwise converts to the specified format.
     */
    outputFormat?: "auto" | "webp" | "jpeg" | "jpg" | "png";
    /**
     * If true, the image is considered a priority and loads eagerly.
     */
    priority?: boolean;
    /**
     * Native loading attribute: "eager" or "lazy". Defaults to "lazy".
     */
    loading?: "eager" | "lazy";
    /**
     * Placeholder handling: "blur" (auto-generated blur placeholder is planned), "empty", or a custom URL.
     */
    placeholder?: "blur" | "empty" | string;
    /**
     * Data URL for a pre-generated blurred placeholder.
     */
    blurDataURL?: string;
    /**
     * If true, bypasses optimization and returns the original image.
     */
    unoptimized?: boolean;
    /**
     * Overrides the image source, bypassing optimization.
     */
    overrideSrc?: string;
    /**
     * Callback invoked when the image has finished loading.
     */
    onLoadingComplete?: (img: HTMLImageElement) => void;
    /**
     * Layout mode: "fill", "fixed", "intrinsic", or "responsive".
     */
    layout?: "fill" | "fixed" | "intrinsic" | "responsive";
    /**
     * CSS objectFit property for controlling how the image fits its container.
     */
    objectFit?: React.CSSProperties["objectFit"];
    /**
     * CSS objectPosition property for positioning the image within its container.
     */
    objectPosition?: React.CSSProperties["objectPosition"];
    /**
     * Boundary for lazy loading.
     */
    lazyBoundary?: string;
    /**
     * Root element for lazy loading.
     */
    lazyRoot?: Element | null;
}
