module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    "node": true
  },
  rules: {
    "no-console": 0,
    "no-useless-constructor": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {"varsIgnorePattern": "^_|React", "args": "none"}]
  },
  parserOptions: {
    "ecmaVersion": 2019,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint", "jest", "import", "prettier"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier/@typescript-eslint",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:prettier/recommended"
      ],
      rules: {
        "brace-style": "error",
        "curly": ["error"],
        "eol-last": ["error", "always"],
        "import/order": ["error"],
        "prettier/prettier": ["error", { "singleQuote": true }],
        "no-console": "off",
        "no-multiple-empty-lines": ["error", { max: 1 }],
        "semi": "off",
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-use-before-define": ["error", {
          functions: false,
          typedefs: false
        }],
        "@typescript-eslint/no-explicit-any": "error"
      }
    }
  ]
}