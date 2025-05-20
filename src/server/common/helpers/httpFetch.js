import { fetch as undiciFetch } from 'undici'
import { config } from '~/src/config/config.js'

/**
 * Wrapper for undici fetch.
 * Adds the request id to the headers for tracking.
 * @param {string} uri
 * @param {RequestInit} options
 * @param {string} requestId
 * @returns Promise<Response>
 */
export const fetch = async (uri, options = {}, requestId) => {
  const { headers = {}, ...rest } = options

  const reqOptions = {
    ...rest,
    headers: {
      ...headers,
      [config.get().tracing.header]: requestId
    }
  }

  return undiciFetch(uri, reqOptions)
}
