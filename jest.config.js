/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"], // top-level structure, `/tests` is outside `/src`
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testRegex: ".*\\.(test|spec)\\.ts$", // match test files with .test.ts or .spec.ts fx's
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
