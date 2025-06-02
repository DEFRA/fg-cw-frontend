import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '../../test-helpers/component-helpers.js'

describe('Case Summary Component Template', () => {
  let $caseSummary

  const mockCaseData = {
    businessName: 'Valley Farm',
    caseRef: 'FG-2023-1234',
    dateReceived: '2023-05-15T09:30:00Z',
    status: 'In progress',
    payload: {
      identifiers: {
        sbi: '123456789'
      },
      answers: {
        scheme: 'Farming Grant'
      }
    }
  }

  describe('Component with complete data', () => {
    beforeEach(() => {
      $caseSummary = renderComponent('caseSummary', {
        caseData: mockCaseData
      })
    })

    test('Should render the business name', () => {
      expect($caseSummary('h1').text().trim()).toBe(mockCaseData.businessName)
    })

    test('Should render the SBI number', () => {
      const sbiElement = $caseSummary('.app-case-cell:nth-child(1) p')
      expect(sbiElement.text()).toContain('SBI:')
      expect(sbiElement.text()).toContain(mockCaseData.payload.identifiers.sbi)
    })

    test('Should render the reference number', () => {
      const refElement = $caseSummary('.app-case-cell:nth-child(2) p')
      expect(refElement.text()).toContain('Reference:')
      expect(refElement.text()).toContain(mockCaseData.caseRef)
    })

    test('Should render the scheme name', () => {
      const schemeElement = $caseSummary('.app-case-cell:nth-child(3) p')
      expect(schemeElement.text()).toContain('Scheme:')
      expect(schemeElement.text()).toContain(
        mockCaseData.payload.answers.scheme
      )
    })

    test('Should render the date received', () => {
      const dateElement = $caseSummary('.app-case-cell:nth-child(4) p')
      expect(dateElement.text()).toContain('Date received:')
      // We don't test the exact formatted date as it depends on the formatDate filter
      // but we can test that the date field is present
      expect(dateElement.text().replace(/\s+/g, ' ').trim()).toMatch(
        /Date received: \d{1,2} \w{3} \d{4}/
      )
    })

    test('Should render the status', () => {
      const statusElement = $caseSummary('.app-case-cell:nth-child(5) p')
      expect(statusElement.text()).toContain('Status:')
      expect(statusElement.text()).toContain(mockCaseData.status)
    })

    test('Should render the back link', () => {
      const backLink = $caseSummary('.govuk-back-link')
      expect(backLink).toHaveLength(1)
      expect(backLink.text().trim()).toBe('Back to cases')
      expect(backLink.attr('href')).toBe('/cases')
    })
  })

  describe('Component with partial data', () => {
    const partialCaseData = {
      // No businessName provided
      caseRef: 'FG-2023-5678',
      dateReceived: '2023-06-20T14:45:00Z',
      status: 'New',
      payload: {
        identifiers: {
          sbi: '987654321'
        },
        answers: {
          scheme: 'Environmental Grant'
        }
      }
    }

    beforeEach(() => {
      $caseSummary = renderComponent('caseSummary', {
        caseData: partialCaseData
      })
    })

    test('Should render the default business name when not provided', () => {
      expect($caseSummary('h1').text().trim()).toBe('Valley Farm')
    })

    test('Should render the correct SBI number', () => {
      const sbiElement = $caseSummary('.app-case-cell:nth-child(1) p')
      expect(sbiElement.text()).toContain(
        partialCaseData.payload.identifiers.sbi
      )
    })
  })
})
