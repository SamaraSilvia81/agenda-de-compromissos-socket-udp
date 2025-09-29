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
      // ✅ CORREÇÃO: Reconhece ambos os ambientes
      globals: {
        ...globals.browser,
        ...globals.node, // Essencial para o server.js
      },
    },
    // Mantém a regra para variáveis não utilizadas
    rules: {
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);