import { describe, expect, beforeEach, test, vi } from 'vitest'
import { wreck, _wreck } from './wreck.js'

const id = 'ABCD-0987'

const mockResponse = {}

describe('wreck', () => {
  let requestSpy
  let readSpy

  beforeEach(() => {
    requestSpy = vi
      .spyOn(_wreck, 'request')
      .mockImplementation(() => mockResponse)
    readSpy = vi.spyOn(_wreck, 'read').mockImplementation(() => ({}))
  })

  test('should merge options', async () => {
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
        'content-type': 'application/json'
      }
    })
    expect(readSpy).toHaveBeenLastCalledWith(expect.any(Object), {
      json: 'strict'
    })
  })
})
