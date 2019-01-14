module.exports.typescript = {
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "jsx": "react",
    "newLine": "LF",
    "lib": ["dom", "es2017"],
    "moduleResolution": "node",
    "importHelpers": true,
    "sourceMap": true,
    "inlineSources": true
  },
  "include": ["src"]
}

module.exports.babel = {
  
}

module.exports.prettier = {
  "trailingComma": "es5",
  "singleQuote": true,
  "semi": false,
  "arrowParens": "always"
}

module.exports.eslint = {
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "extends": [
    "standard",
    "standard-jsx",
    "plugin:prettier/recommended",
    "prettier/react",
    "prettier/standard"
  ],
  "rules": {
    "linebreak-style": ["error", "unix"]
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "parser": "typescript-eslint-parser",
      "plugins": ["typescript"],
      "rules": {
        "import/export": "off",
        "no-dupe-class-members": "off",
        "no-empty-pattern": "off",
        "no-redeclare": "off",
        "no-unused-vars": "off",
        "no-undef": "off",
        "no-unused-expressions": "off",
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "typescript/no-unused-vars": "error",
        "standard/no-callback-literal": "off"
      }
    }
  ]
}



/*
  compilerOptions: {

  }
*/