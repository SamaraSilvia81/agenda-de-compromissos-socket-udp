import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    // >>> ADICIONE ESTA SEÇÃO DE REGRAS <<<
    rules: {
      "no-unused-vars": [
        "error", // Mantém a regra como um erro, mas com as opções abaixo
        {
          "args": "after-used",
          "argsIgnorePattern": "^_" // Ignora argumentos que começam com '_'
        }
      ]
    }
  },
]);