module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:unicorn/recommended",
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint",
    ],
    "rules": {
        "no-case-declarations": "off",
        "no-extra-boolean-cast": "off",
        "no-shadow": "off",
        "no-use-before-define": "off",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "unicorn/no-null": "off",
        "unicorn/no-await-expression-member": "off",
        "unicorn/prefer-code-point": "off",
        "unicorn/prefer-ternary": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/no-for-loop": "off",
        "unicorn/numeric-separators-style": "off",
    },
    "env": {
        "browser": true
    },
    "settings": {
    },
};
