/**
 * @type {Options}
 */
export default {
  plugins: ['prettier-plugin-jinja-template'],
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    // Keep any other overrides you might already have
    // ...

    // Add this object to handle Nunjucks files
    {
      // Files to target: typical Nunjucks extensions
      files: ['*.njk', '*.nunjucks'],
      // Options specific to these files
      options: {
        // Specify the parser provided by the plugin
        parser: 'jinja-template'
        // You can add other Nunjucks-specific options here if needed,
        // but usually, just setting the parser is enough.
        // For example, if you wanted a different printWidth ONLY for njk files:
        // printWidth: 120,
      }
    }
  ]
}

/**
 * @import { Options } from 'prettier'
 */
