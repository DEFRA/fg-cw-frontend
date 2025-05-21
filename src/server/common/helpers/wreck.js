import Wreck from '@hapi/wreck'
import { config } from '~/src/config/config.js'

export const _wreck = Wreck.defaults({
  events: true,
  timeout: 3000,
  baseUrl: config.get('fg_cw_backend_url')
})

export const wreck = async (options = {}, requestId) => {
  const { uri, method = 'GET', headers = {}, ...rest } = options
  const reqOptions = {
    ...rest,
    headers: {
      ...headers,
      [config.get().tracing.header]: requestId
    }
  }

  const response = await _wreck.request(method, uri, reqOptions)
  return _wreck.read(response, {
    json: 'strict'
  })
}
