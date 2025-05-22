import Wreck from '@hapi/wreck'
import { config } from '~/src/config/config.js'
import { getTraceId } from '@defra/hapi-tracing'

export const _wreck = Wreck.defaults({
  events: true,
  timeout: 3000,
  baseUrl: config.get('fg_cw_backend_url')
})

_wreck.events.on('preRequest', (uri) => {
  const traceId = getTraceId()

  if (traceId) {
    uri.headers[config.tracingHeader] = traceId
  }
})

export const wreck = async (options = {}) => {
  const { uri, method = 'GET', headers = {}, ...rest } = options
  const reqOptions = {
    ...rest,
    headers: {
      ...headers
    }
  }

  const response = await _wreck.request(method, uri, reqOptions)
  return _wreck.read(response, {
    json: 'strict'
  })
}
