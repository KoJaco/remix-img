// tests/integration/remixImage.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Image from "../../src/components/image";

// Example integration tests for the RemixImage component
describe("<RemixImage />", () => {
    test("renders image with correct alt attribute and uses unoptimized src", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Example image"
                width={600}
                height={400}
                unoptimized={true} // so it simply returns the original src
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement).toBeInTheDocument();
        // JSDOM automatically resolves relative URLs; to compare, use the full URL.
        expect(imgElement.src).toBe("https://example.com/image.jpg");
    });

    test("applies lazy loading by default", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                alt="Example image"
                width={600}
                height={400}
                unoptimized={true}
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement.loading).toBe("lazy");
    });

    test("uses overrideSrc if provided", () => {
        render(
            <Image
                src="https://example.com/image.jpg"
                overrideSrc="https://cdn.example.com/optimized.jpg"
                alt="Example image"
                width={600}
                height={400}
            />
        );
        const imgElement = screen.getByAltText(
            "Example image"
        ) as HTMLImageElement;
        expect(imgElement.src).toBe("https://cdn.example.com/optimized.jpg");
    });
});
