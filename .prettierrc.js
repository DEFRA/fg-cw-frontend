// @ts-check

/**
 * @type {import("prettier").Options}
 */
export default {
  plugins: ['prettier-plugin-jinja-template'],
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    {
      files: ['*.njk', '*.nunjucks'],
      options: {
        parser: 'jinja-template'
      }
    }
  ]
}
