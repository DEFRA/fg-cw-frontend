import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import process from 'node:process'
import { createLogger } from './server/common/helpers/logging/logger.js'
import { startServer } from './server/common/helpers/start-server.js'

// Mock the dependencies
const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
}

vi.mock('./server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

vi.mock('./server/common/helpers/start-server.js', () => ({
  startServer: vi.fn()
}))

describe('index.js', () => {
  let originalProcessOn
  let originalProcessExitCode

  beforeEach(() => {
    // Store original process methods
    originalProcessOn = process.on.bind(process)
    originalProcessExitCode = process.exitCode

    // Reset all mocks
    vi.clearAllMocks()

    // Mock process.on before importing index.js
    process.on = vi.fn()
  })

  afterEach(() => {
    // Restore original process methods
    process.on = originalProcessOn
    process.exitCode = originalProcessExitCode

    // Clear module cache to ensure fresh import on next test
    vi.resetModules()
  })

  it('should start the server', async () => {
    // Import the index file to trigger the server start
    await import('./index.js')

    // Verify that startServer was called
    expect(startServer).toHaveBeenCalledTimes(1)
  })

  it('should handle unhandled rejections', async () => {
    // Import the index file to set up the unhandled rejection handler
    await import('./index.js')

    // Verify that process.on was called with 'unhandledRejection'
    expect(process.on).toHaveBeenCalledWith(
      'unhandledRejection',
      expect.any(Function)
    )

    // Get the handler function safely
    const mockCalls = vi.mocked(process.on).mock.calls
    const rejectionHandler = mockCalls[0][1]
    const mockError = new Error('Test error')

    // Call the handler with a mock error
    rejectionHandler(mockError)

    // Verify that logger was created and used correctly
    expect(createLogger).toHaveBeenCalledTimes(1)
    expect(mockLogger.info).toHaveBeenCalledWith('Unhandled rejection')
    expect(mockLogger.error).toHaveBeenCalledWith(mockError)
    expect(process.exitCode).toBe(1)
  })
})
