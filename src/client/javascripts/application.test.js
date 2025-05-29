import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock govuk-frontend module
const mockCreateAll = vi.fn()
const mockButton = {}
const mockCheckboxes = {}
const mockErrorSummary = {}
const mockHeader = {}
const mockRadios = {}
const mockSkipLink = {}
const mockTabs = {}

vi.mock('govuk-frontend', () => ({
  createAll: mockCreateAll,
  Button: mockButton,
  Checkboxes: mockCheckboxes,
  ErrorSummary: mockErrorSummary,
  Header: mockHeader,
  Radios: mockRadios,
  SkipLink: mockSkipLink,
  Tabs: mockTabs
}))

describe('application.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset modules to ensure fresh import on next test
    vi.resetModules()
  })

  it('should import all required GOV.UK Frontend components', async () => {
    // Import the application file
    await import('./application.js')

    // Verify that createAll was called for each component
    expect(mockCreateAll).toHaveBeenCalledTimes(7)
    expect(mockCreateAll).toHaveBeenCalledWith(mockButton)
    expect(mockCreateAll).toHaveBeenCalledWith(mockCheckboxes)
    expect(mockCreateAll).toHaveBeenCalledWith(mockErrorSummary)
    expect(mockCreateAll).toHaveBeenCalledWith(mockHeader)
    expect(mockCreateAll).toHaveBeenCalledWith(mockRadios)
    expect(mockCreateAll).toHaveBeenCalledWith(mockSkipLink)
    expect(mockCreateAll).toHaveBeenCalledWith(mockTabs)
  })

  it('should initialize components in the correct order', async () => {
    await import('./application.js')

    // Verify the order of createAll calls matches the order in the file
    const calls = mockCreateAll.mock.calls
    expect(calls[0][0]).toBe(mockButton)
    expect(calls[1][0]).toBe(mockCheckboxes)
    expect(calls[2][0]).toBe(mockErrorSummary)
    expect(calls[3][0]).toBe(mockHeader)
    expect(calls[4][0]).toBe(mockRadios)
    expect(calls[5][0]).toBe(mockSkipLink)
    expect(calls[6][0]).toBe(mockTabs)
  })
})
