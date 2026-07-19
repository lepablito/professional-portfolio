import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
  ...tseslint.configs.recommendedTypeChecked,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    // Type-aware rules need a tsconfig project behind each file; .astro
    // frontmatter and plain .mjs scripts/configs don't have one.
    files: ["**/*.astro", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
