// TODO: I want to support auto processing of a blur image placeholder, but for now you just need to provide a src url.

export interface ImageProps
    extends Omit<
        React.DetailedHTMLProps<
            React.ImgHTMLAttributes<HTMLImageElement>,
            HTMLImageElement
        >,
        "src" | "alt" | "width" | "height" | "loading"
    > {
    src: string;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    loader?: (src: string, width: number, quality?: number) => string;
    quality?: number | `${number}`;
    outputFormat?: "auto" | "webp" | "jpeg" | "jpg" | "png";
    priority?: boolean;
    loading?: "eager" | "lazy";
    placeholder?: "blur" | "empty" | string; // "blur" to auto-generate, or a URL for a custom placeholder.
    blurDataURL?: string;
    unoptimized?: boolean;
    overrideSrc?: string;
    onLoadingComplete?: (img: HTMLImageElement) => void;
    layout?: "fill" | "fixed" | "intrinsic" | "responsive";
    objectFit?: React.CSSProperties["objectFit"];
    objectPosition?: React.CSSProperties["objectPosition"];
    lazyBoundary?: string;
    lazyRoot?: Element | null;
}
