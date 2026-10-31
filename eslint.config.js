import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig([
  globalIgnores(["dist/", ".tools/", ".npm-cache/", ".npm-global/"]),
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  {
    rules: {
      eqeqeq: ["error", "always"],
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      // 文字列を HTML として解釈させる API は XSS の入口になるため禁止する。
      // 画面に文字を出すときは textContent、要素は createElement で作る。
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression > MemberExpression.left[property.name=/^(innerHTML|outerHTML)$/]",
          message:
            "innerHTML / outerHTML は使わず、textContent と createElement を使ってください。",
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message:
            "insertAdjacentHTML は使わず、createElement と append を使ってください。",
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
          message: "document.write は使わないでください。",
        },
      ],
    },
  },
  prettier,
]);
