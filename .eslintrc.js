module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true,
    "jest": true,
  },
  "plugins": [
    "react",
    "jsx-a11y",
    "import",
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
  },
  "parser": "babel-eslint",
  "rules": {
    // https://eslint.org/docs/rules/arrow-parens
    "arrow-parens": [
      "error",
      "as-needed",
    ],
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-prop-types.md
    "react/forbid-prop-types": 0,
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    "react/jsx-filename-extension": 0,
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": true,
        "optionalDependencies": false,
        "peerDependencies": false,
        "packageDir": "./",
      },
    ],
    // https://eslint.org/docs/rules/semi
    "semi": ["error", "always"],
    // https://eslint.org/docs/rules/max-len
    "max-len": ["error", {
      "code": 150,
      "ignoreComments": true,
      "ignoreUrls": true,
    }],
    // https://eslint.org/docs/rules/comma-dangle
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "always-multiline",
    }],
    "import/prefer-default-export": 0,
    // https://eslint.org/docs/rules/no-param-reassign
    "no-param-reassign": ["error", {
      "ignorePropertyModificationsFor": ["reduce"],
    }],
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-named-as-default.md
    "import/no-named-as-default": 0,
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-named-as-default-member.md
    "import/no-named-as-default-member": 0,
    // https://eslint.org/docs/rules/no-else-return
    "no-else-return": ["error", {
      allowElseIf: true
    }],
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/named.md
    "import/named": 0,
    // https://www.npmjs.com/package/eslint-plugin-import
    "import/export": 0,
    // https://eslint.org/docs/rules/object-curly-newline
    "object-curly-newline": ["error", {
      "ObjectExpression": "always",
      "ObjectPattern": {
        "multiline": true,
        "minProperties": 5,
      },
      "ImportDeclaration": "never",
      "ExportDeclaration": {
        "multiline": true,
        "minProperties": 5,
      }
    }],
    "object-property-newline": ["error", {
      "allowAllPropertiesOnSameLine": false,
    }],
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-one-expression-per-line.md
    "react/jsx-one-expression-per-line": 0,
  }
}
