import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Tabs
} from 'govuk-frontend'

vi.mock('govuk-frontend')

describe('application.js', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('should import all required GOV.UK Frontend components', async () => {
    await import('./application.js')

    expect(createAll).toHaveBeenCalledTimes(7)
    expect(createAll).toHaveBeenCalledWith(Button)
    expect(createAll).toHaveBeenCalledWith(Checkboxes)
    expect(createAll).toHaveBeenCalledWith(ErrorSummary)
    expect(createAll).toHaveBeenCalledWith(Header)
    expect(createAll).toHaveBeenCalledWith(Radios)
    expect(createAll).toHaveBeenCalledWith(SkipLink)
    expect(createAll).toHaveBeenCalledWith(Tabs)
  })

  it('should initialize components in the correct order', async () => {
    await import('./application.js')

    expect(createAll).toHaveBeenNthCalledWith(1, Button)
    expect(createAll).toHaveBeenNthCalledWith(2, Checkboxes)
    expect(createAll).toHaveBeenNthCalledWith(3, ErrorSummary)
    expect(createAll).toHaveBeenNthCalledWith(4, Header)
    expect(createAll).toHaveBeenNthCalledWith(5, Radios)
    expect(createAll).toHaveBeenNthCalledWith(6, SkipLink)
    expect(createAll).toHaveBeenNthCalledWith(7, Tabs)
  })
})
