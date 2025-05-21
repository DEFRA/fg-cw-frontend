import { describe, expect, test, vi, beforeAll, afterAll } from 'vitest'
import hapi from '@hapi/hapi'
import { startServer } from './start-server.js'
import { createServer } from '../../index.js'
import { config } from '../../../config/config.js'

const mockLoggerInfo = vi.hoisted(() => vi.fn())
const mockLoggerError = vi.hoisted(() => vi.fn())

vi.mock('hapi-pino', () => ({
  default: {
    register: (server) => {
      server.decorate('server', 'logger', {
        info: vi.fn(),
        error: vi.fn()
      })
    },
    name: 'mock-hapi-pino'
  }
}))
vi.mock('./logging/logger.js', () => ({
  createLogger: () => ({
    info: mockLoggerInfo,
    error: mockLoggerError
  })
}))
vi.mock('../../index.js', { spy: true })
vi.mock('./start-server.js', { spy: true })

describe('#startServer', () => {
  let hapiServerSpy

  beforeAll(() => {
    config.set('port', 3098)
    hapiServerSpy = vi.spyOn(hapi, 'server')
  })

  describe('When server starts', () => {
    let server

    afterAll(async () => {
      await server.stop({ timeout: 0 })
    })

    test('Should start up server as expected', async () => {
      server = await startServer()

      expect(createServer).toHaveBeenCalled()
      expect(hapiServerSpy).toHaveBeenCalled()
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
      expect(server.logger.info).toHaveBeenNthCalledWith(
        1,
        'Custom secure context is disabled'
      )
      expect(server.logger.info).toHaveBeenNthCalledWith(
        2,
        'Server started successfully'
      )
      expect(server.logger.info).toHaveBeenNthCalledWith(
        3,
        'Access your frontend on http://localhost:3098'
      )
    })
  })

  describe('When server start fails', () => {
    beforeAll(() => {
      createServer.mockRejectedValue(new Error('Server failed to start'))
    })

    test('Should log failed startup message', async () => {
      await startServer()

      expect(mockLoggerInfo).toHaveBeenCalledWith('Server failed to start :(')
      expect(mockLoggerError).toHaveBeenCalledWith(
        Error('Server failed to start')
      )
    })
  })
})
