import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // ✅ VERSÃO FINAL E SIMPLIFICADA DA REGRA
    rules: {
      "no-unused-vars": [
        "error",
        {
          // Apenas a opção essencial para ignorar o '_e'
          "argsIgnorePattern": "^_"
        }
      ]
    }
  },
]);