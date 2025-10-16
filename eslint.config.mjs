// eslint.config.js
import globals from "globals";
import js from "@eslint/js";

export default [
  // Apply ESLint's recommended rules to all JavaScript files
  js.configs.recommended,

  // --- Configuration for your Node.js server files ---
  {
    files: ["**/*.js"],
    // Ignore the public folder for this Node.js specific config
    ignores: ["public/**"], 
    languageOptions: {
      globals: {
        ...globals.node, // Add all Node.js global variables
      },
    },
  },

  // --- Configuration for your client-side browser script ---
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Add custom globals from your libraries here
        "bootstrap": "readonly",
        "Cropper": "readonly"
      },
    },
  },
];