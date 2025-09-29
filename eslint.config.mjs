import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js,
    },
    // Use the recommended rules as a base.
    extends: ["js/recommended"],
    languageOptions: {
      // Define the global variables available in the environment.
      globals: {
        ...globals.browser, // For browser environments
        ...globals.node,    // For Node.js environments (like server.js)
      },
    },
    // The problematic 'rules' section has been removed.
    // The 'no-unused-vars' error is now handled directly in server.js
    // with an 'eslint-disable-next-line' comment for reliability.
  },
]);