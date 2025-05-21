import { describe, expect, beforeEach, test, vi } from 'vitest'
import { config } from '~/src/config/config.js'
import { wreck, _wreck } from './wreck.js'

const id = 'ABCD-0987'

describe('httpwreck', () => {
  let requestSpy
  let readSpy

  beforeEach(() => {
    config.set('tracing', { header: 'FOO' })
    requestSpy = vi.spyOn(_wreck, 'request')
    readSpy = vi.spyOn(_wreck, 'read')
  })

  test('should add request id to headers', async () => {
    await wreck({ uri: 'some/url.com' }, id)

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(requestSpy).toHaveBeenLastCalledWith('GET', 'some/url.com', {
      headers: { FOO: 'ABCD-0987' }
    })
    expect(readSpy).toHaveBeenLastCalledWith(expect.any(Object), {
      json: 'strict'
    })
  })

  test('should add to existing options', async () => {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    }
    await wreck({ uri: 'some/url.com', ...options }, id)

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(requestSpy).toHaveBeenLastCalledWith('POST', 'some/url.com', {
      headers: {
        FOO: 'ABCD-0987',
        'content-type': 'application/json'
      }
    })
    expect(readSpy).toHaveBeenLastCalledWith(expect.any(Object), {
      json: 'strict'
    })
  })
})
