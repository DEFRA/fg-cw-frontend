import eslintConfigPrettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";
import neostandard from "neostandard";

export default [
  globalIgnores([".public", ".server"]),
  ...neostandard({
    env: ["node"],
  }),
  eslintConfigPrettier,
  {
    files: ["src/**/*"],
    rules: {
      "func-style": ["error", "expression"],
      "no-console": "error",
      complexity: ["error", { max: 4 }],
      "import-x/extensions": ["error", { js: "always", json: "always" }],
      "import-x/no-unresolved": "error",
      "import-x/named": "error",
      "import-x/default": "error",
      "import-x/export": "error",
      "import-x/no-default-export": "error",
      "import-x/no-mutable-exports": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-useless-path-segments": "error",
      "import-x/no-cycle": "error",
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["src/**/*.test.js"],
        },
      ],
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "**/repositories/**/!(*.test).js",
              from: ["**/routes/**", "**/use-cases/**"],
              message:
                "Respositories should not import routes, use cases or view models",
            },
            {
              target: "**/routes/**/!(*.test).js",
              from: ["src/**/**"],
              except: [
                "**/common/helpers/**",
                "**/use-cases/**",
                "**/view-models/**",
                "**/schemas/**",
                "**/common/logger.js",
              ],
              message:
                "Routes should only import use cases, view models and schemas",
            },
            {
              target: "**/use-cases/**/!(*.test).js",
              from: ["src/**/**"],
              except: ["**/common/**", "**/repositories/**", "**/use-cases/**"],
              message:
                "Use cases should only import common, repositories and other use cases",
            },
          ],
        },
      ],
    },
  },
];
