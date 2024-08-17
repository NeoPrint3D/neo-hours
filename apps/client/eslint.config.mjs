// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "@stylistic/quotes": "off",
    "@stylistic/comma-dangle": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@stylistic/multiline-ternary": "off",
    "vue/no-v-html": "off",
  },
});
// Your custom configs here
