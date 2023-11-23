module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: "standard",
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        semi: ["error", "always"],
        indent: ["error", 4],
        quotes: ["error", "double"],
        "comma-dangle": ["error", "always-multiline"],
        "space-before-function-paren": ["error", "never"],
        "unused-imports/no-unused-imports": "error",
    },
    plugins: ["unused-imports"],
};
