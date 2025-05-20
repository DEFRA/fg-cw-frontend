import { config } from '~/src/config/config.js'
import { tracing } from '@defra/hapi-tracing'

const tracingHeader = config.get('tracing.header')

export const requestTracing = {
  plugin: tracing.plugin,
  options: {
    tracingHeader,
    debug: true // Enable debug mode to see more information
  }
}
