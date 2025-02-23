// tests/config.test.ts
import { getConfig, updateConfig } from "../src/config/remix-img.config";
import type { RemixImageConfig } from "../src/types";

describe("updateConfig", () => {
    it("should override the default config", () => {
        // Save the current config
        const defaultConfig = getConfig();

        // Update the config
        updateConfig({
            allowedDomains: ["allowed.com"],
            defaultQuality: 90,
        });

        // Retrieve the updated config
        const updatedConfig: RemixImageConfig = getConfig();

        expect(updatedConfig.allowedDomains).toContain("allowed.com");
        expect(updatedConfig.defaultQuality).toEqual(90);

        // reset config for further tests
        // updateConfig(defaultConfig);
    });
});
