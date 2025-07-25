module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": ["error", {"code": 120}],
    "indent": "off", // Turns off indentation checking completely
  },
  parserOptions: {
    "ecmaVersion": 2020,
  },
};
