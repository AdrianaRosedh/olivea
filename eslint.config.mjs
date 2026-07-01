// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "**/.next/**",        // nested build output (e.g. inside .claude worktrees)
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    ".claude/**",         // Claude local state + git worktrees — never lint these
    "next-env.d.ts",
  ]),

  ...nextVitals,
  ...nextTs,
  prettier,

  {
    rules: {
      // keep yours
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    
      // ✅ silence the new over-strict hooks rules
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      // React Compiler advisory — flags manual useCallback/useMemo deps it
      // can't auto-preserve. Informational, not a correctness bug; same
      // stance as the rules above.
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);