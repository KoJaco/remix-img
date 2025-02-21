import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ImageProps } from "../types/props";
import { buildOptimizedImageUrl, generateSrcSet } from "../utils";

// Forward ref so that you can access underlying <img/> el
const Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
    const {
        src,
        alt,
        width,
        height,
        fill,
        layout,
        priority,
        loading,
        placeholder,
        onError,
        onLoadingComplete,
        unoptimized,
        overrideSrc,
        objectFit,
        objectPosition,
        ...rest
    } = props;

    const [imgSrc, setImgSrc] = useState<string>("");
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Decide which URL to use: overrideSrc takes precedence, then unoptimized, then optimized URL.
    const finalSrc =
        overrideSrc || (unoptimized ? src : buildOptimizedImageUrl(props));

    // 2. Generate srcSet and sizes only if not in fill mode.
    const srcSet =
        !fill && !(props.layout === "fill") ? generateSrcSet(props) : undefined;
    const sizes =
        srcSet && typeof width === "number"
            ? `(max-width: ${width}px) 100vw, ${width}px`
            : undefined;

    // 3. Determine lazy-loading strat
    useEffect(() => {
        if (priority) {
            setImgSrc(finalSrc);
            return;
        }

        if ("loading" in HTMLImageElement.prototype) {
            setImgSrc(finalSrc);
        } else {
            let observer: IntersectionObserver;
            if (imgRef.current) {
                observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setImgSrc(finalSrc);
                            observer.disconnect();
                        }
                    });
                });
                observer.observe(imgRef.current);
            }
            return () => observer && observer.disconnect();
        }
    }, [finalSrc, priority]);

    // 4. Prepare styles. For fill/layout, set positioning.
    const imgStyle: React.CSSProperties = {
        ...props.style,
    };

    if (fill || layout === "fill") {
        imgStyle.position = "absolute";
        imgStyle.top = 0;
        imgStyle.left = 0;
        imgStyle.width = "100%";
        imgStyle.height = "100%";
        if (objectFit) imgStyle.objectFit = objectFit;
        if (objectPosition) imgStyle.objectPosition = objectPosition;
    }

    return (
        <img
            ref={(node) => {
                imgRef.current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    (ref as React.RefObject<HTMLImageElement | null>).current =
                        node;
                }
            }}
            src={
                imgSrc ||
                (placeholder && typeof placeholder === "string"
                    ? placeholder
                    : undefined)
            }
            alt={alt}
            // For non-fill layouts, convert width/height to numbers.
            width={
                typeof width === "number"
                    ? width
                    : width
                    ? parseInt(width as string, 10)
                    : undefined
            }
            height={
                typeof height === "number"
                    ? height
                    : height
                    ? parseInt(height as string, 10)
                    : undefined
            }
            loading={priority ? "eager" : loading || "lazy"}
            onLoad={(e) => {
                setIsLoaded(true);
                if (onLoadingComplete) {
                    onLoadingComplete(e.currentTarget);
                }
            }}
            onError={onError}
            srcSet={srcSet}
            sizes={sizes}
            {...rest} // spread in other props
            style={{
                // Fade-in effect and blur until loaded, if placeholder provided.
                transition: "filter 0.3s ease-out",
                filter: !isLoaded && placeholder ? "blur(20px)" : "none",
                ...imgStyle,
            }}
        />
    );
});

Image.displayName = "Image";

export default Image;
