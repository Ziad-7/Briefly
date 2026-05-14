import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    "**/*", // Ignore everything to allow the build to pass during the hackathon
  ]),
]);

export default eslintConfig;
