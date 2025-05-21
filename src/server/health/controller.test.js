import { describe, test, expect } from 'vitest'
import { healthController } from './controller.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('healthController', () => {
  test('should return success message with status 200', () => {
    const responseMock = {
      response: (payload) => ({
        code: (statusCode) => ({ payload, statusCode })
      })
    }

    const result = healthController.handler(null, responseMock)
    const expectedResponse = {
      payload: { message: 'success' },
      statusCode: statusCodes.ok
    }

    expect(result).toEqual(expectedResponse)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
