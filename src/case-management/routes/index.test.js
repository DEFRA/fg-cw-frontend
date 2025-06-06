import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { caseManagement } from './index.js'

// Mock dependencies
const mockCaseController = vi.hoisted(() => ({
  listCases: vi.fn()
}))

vi.mock('./case.controller.js', () => ({
  caseController: mockCaseController
}))

describe('caseManagement plugin', () => {
  let mockServer

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock server with route method
    mockServer = {
      route: vi.fn()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('has correct plugin structure', () => {
    expect(caseManagement).toHaveProperty('plugin')
    expect(caseManagement.plugin).toHaveProperty('name')
    expect(caseManagement.plugin).toHaveProperty('register')
    expect(typeof caseManagement.plugin.register).toBe('function')
  })

  test('has correct plugin name', () => {
    expect(caseManagement.plugin.name).toBe('case-management')
  })

  test('registers routes when plugin is registered', () => {
    caseManagement.plugin.register(mockServer)

    expect(mockServer.route).toHaveBeenCalledOnce()
    expect(mockServer.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/cases',
        handler: mockCaseController.listCases
      }
    ])
  })

  test('registers GET /cases route with correct handler', () => {
    caseManagement.plugin.register(mockServer)

    const routeCall = mockServer.route.mock.calls[0]
    const routes = routeCall[0]

    expect(routes).toHaveLength(1)

    const casesRoute = routes[0]
    expect(casesRoute.method).toBe('GET')
    expect(casesRoute.path).toBe('/cases')
    expect(casesRoute.handler).toBe(mockCaseController.listCases)
  })

  test('passes array of routes to server.route', () => {
    caseManagement.plugin.register(mockServer)

    const routeCall = mockServer.route.mock.calls[0]
    const routes = routeCall[0]

    expect(Array.isArray(routes)).toBe(true)
  })

  test('register function accepts server parameter', () => {
    expect(() => {
      caseManagement.plugin.register(mockServer)
    }).not.toThrow()

    expect(mockServer.route).toHaveBeenCalled()
  })

  test('plugin can be registered multiple times without error', () => {
    const mockServer1 = { route: vi.fn() }
    const mockServer2 = { route: vi.fn() }

    expect(() => {
      caseManagement.plugin.register(mockServer1)
      caseManagement.plugin.register(mockServer2)
    }).not.toThrow()

    expect(mockServer1.route).toHaveBeenCalledOnce()
    expect(mockServer2.route).toHaveBeenCalledOnce()
  })
})
