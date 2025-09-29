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
      // CORREÇÃO: Adiciona os globais do Node.js de volta
      globals: {
        ...globals.browser,
        ...globals.node, // Essencial para reconhecer 'process', 'require', etc.
      },
    },
    // Mantém a regra corrigida anteriormente para variáveis não utilizadas
    rules: {
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_", // Ignora argumentos que começam com '_'
        },
      ],
    },
  },
]);