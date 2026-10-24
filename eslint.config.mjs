import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".tmp/**",
      "reports/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
        HTMLAnchorElement: "readonly",
        Request: "readonly",
        Response: "readonly",
        KeyboardEvent: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        performance: "readonly",
        getComputedStyle: "readonly",
        Image: "readonly",
        localStorage: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "off",
    },
  },
);
