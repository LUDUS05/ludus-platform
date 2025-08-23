import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend from root config
  ...compat.extends("../../eslint.config.js"),
  
  // Next.js specific overrides
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Web-specific rules
  {
    files: ["**/*.tsx", "**/*.ts"],
    languageOptions: {
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
    },
  },
];
