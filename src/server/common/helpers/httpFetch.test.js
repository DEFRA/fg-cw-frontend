import * as undici from 'undici'
import { config } from '~/src/config/config.js'
import { fetch } from './httpFetch.js'

jest.mock('undici', () => ({
  fetch: jest.fn().mockResolvedValue()
}))

describe('httpFetch', () => {
  beforeEach(() => {
    config.set('tracing', { header: 'FOO' })
  })

  const id = 'ABCD-0987'

  test('should add request id to headers', async () => {
    await fetch('some/url.com', {}, id)

    expect(undici.fetch).toHaveBeenCalledTimes(1)
    expect(undici.fetch).toHaveBeenLastCalledWith('some/url.com', {
      headers: { FOO: 'ABCD-0987' }
    })
  })

  test('should add to existing options', async () => {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    }
    await fetch('some/url.com', options, id)

    expect(undici.fetch).toHaveBeenCalledTimes(1)
    expect(undici.fetch).toHaveBeenLastCalledWith('some/url.com', {
      method: 'POST',
      headers: {
        FOO: 'ABCD-0987',
        'content-type': 'application/json'
      }
    })
  })
})
