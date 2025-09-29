// eslint.config.mjs

import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      // It's good practice to specify the ECMAScript version
      ecmaVersion: 2022, 
      // Your project uses ES modules
      sourceType: "module", 
      globals: {
        // THIS IS THE FIX: It tells ESLint to recognize Node.js global variables
        ...globals.node, 
      },
    },
    // You can add recommended rule sets here if needed
    // extends: ["js/recommended"], 
    rules: {
      // You can add any custom rules here if you wish
    }
  },
];