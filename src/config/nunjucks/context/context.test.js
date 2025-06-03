import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock dependencies
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockLoggerError = vi.hoisted(() => vi.fn())
const mockConfig = vi.hoisted(() => ({
  get: vi.fn()
}))
const mockBuildNavigation = vi.hoisted(() => vi.fn())

vi.mock('node:fs', async () => {
  const actualFs = await vi.importActual('node:fs')
  return {
    ...actualFs,
    default: {
      readFileSync: mockReadFileSync
    },
    readFileSync: mockReadFileSync
  }
})

vi.mock('../../config.js', () => ({
  config: mockConfig
}))

vi.mock('../../../server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({ error: (...args) => mockLoggerError(...args) })
}))

vi.mock('./build-navigation.js', () => ({
  buildNavigation: mockBuildNavigation
}))

describe('context', () => {
  beforeEach(() => {
    // Reset module between tests
    vi.resetModules()

    // Setup default mock returns
    mockConfig.get.mockImplementation((key) => {
      const values = {
        assetPath: '/public',
        root: '/app',
        serviceName: 'Test Service'
      }
      return values[key]
    })

    mockBuildNavigation.mockReturnValue([
      { text: 'Home', url: '/', isActive: true }
    ])
  })

  describe('when webpack manifest exists', () => {
    beforeEach(() => {
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          'app.js': 'js/app-123.js',
          'style.css': 'css/style-123.css'
        })
      )
    })

    test('should return correct context object', async () => {
      const { context } = await import('./context.js')
      const result = context({ path: '/' })

      expect(result).toEqual({
        assetPath: '/public/assets',
        serviceName: 'Test Service',
        serviceUrl: '/',
        breadcrumbs: [],
        navigation: [{ text: 'Home', url: '/', isActive: true }],
        getAssetPath: expect.any(Function)
      })
    })

    test('should return correct asset path for known assets', async () => {
      const { context } = await import('./context.js')
      const result = context({ path: '/' })

      expect(result.getAssetPath('app.js')).toBe('/public/js/app-123.js')
      expect(result.getAssetPath('style.css')).toBe('/public/css/style-123.css')
    })

    test('should return fallback path for unknown assets', async () => {
      const { context } = await import('./context.js')
      const result = context({ path: '/' })

      expect(result.getAssetPath('unknown.png')).toBe('/public/unknown.png')
    })

    test('should cache manifest after first read', async () => {
      const { context } = await import('./context.js')

      // First call
      context({ path: '/' })
      expect(mockReadFileSync).toHaveBeenCalledTimes(1)

      // Second call
      context({ path: '/' })
      expect(mockReadFileSync).toHaveBeenCalledTimes(1) // Still 1, not 2
    })
  })

  describe('when webpack manifest read fails', () => {
    beforeEach(() => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })
    })

    test('should log error and continue', async () => {
      const { context } = await import('./context.js')
      const result = context({ path: '/' })

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Webpack assets-manifest.json not found'
      )
      expect(result.getAssetPath('app.js')).toBe('/public/app.js')
    })

    test('should provide working context even when manifest is missing', async () => {
      const { context } = await import('./context.js')
      const result = context({ path: '/' })

      expect(result).toEqual({
        assetPath: '/public/assets',
        serviceName: 'Test Service',
        serviceUrl: '/',
        breadcrumbs: [],
        navigation: [{ text: 'Home', url: '/', isActive: true }],
        getAssetPath: expect.any(Function)
      })
    })
  })

  describe('with null request', () => {
    test('should handle null request gracefully', async () => {
      const { context } = await import('./context.js')
      const result = context(null)

      expect(result).toEqual({
        assetPath: '/public/assets',
        serviceName: 'Test Service',
        serviceUrl: '/',
        breadcrumbs: [],
        navigation: [{ text: 'Home', url: '/', isActive: true }],
        getAssetPath: expect.any(Function)
      })
    })
  })
})
