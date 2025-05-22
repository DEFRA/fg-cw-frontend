import Wreck from '@hapi/wreck'
import { config } from '~/src/config/config.js'
import { getTraceId } from '@defra/hapi-tracing'

export const wreck = Wreck.defaults({
  events: true,
  timeout: 3000,
  baseUrl: config.get('fg_cw_backend_url')
})

wreck.events.on('preRequest', (uri) => {
  const traceId = getTraceId()

  if (traceId) {
    uri.headers[config.tracingHeader] = traceId
  }
})
