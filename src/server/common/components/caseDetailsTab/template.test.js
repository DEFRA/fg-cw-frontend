import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Case Details Tab', () => {
  let $details

  const mockCaseData = {
    payload: {
      submittedAt: '2024-03-20',
      answers: {
        field1: 'value1',
        field2: 'value2',
        actionApplications: [
          {
            appliedFor: {
              quantity: 100,
              unit: 'kg'
            },
            location: 'Field A',
            notes: 'Test notes'
          }
        ]
      }
    },
    caseId: 'CASE123',
    status: 'In Progress'
  }

  describe('Component', () => {
    beforeEach(() => {
      $details = renderComponent('caseDetailsTab', {
        caseData: mockCaseData
      })
    })

    test('Should render case details component with expected heading', () => {
      expect($details('h2')).toHaveLength(2) // Main heading + Action cases data heading
      expect($details('h2').first().text().trim()).toBe('Case')
    })

    test('Should render submitted date', () => {
      expect($details('p.govuk-body')).toHaveLength(1)
      expect($details('p.govuk-body').text()).toContain('submitted:')
    })

    test('Should render top-level case data table', () => {
      expect($details('table')).toHaveLength(3)
      expect($details('table').first().find('tr')).toHaveLength(2)
    })

    test('Should render answers table', () => {
      const answersTable = $details('table').eq(1)
      expect(answersTable.find('caption').text().trim()).toBe('Answers')
      expect(answersTable.find('tr')).toHaveLength(2) // Header + 1 data row (field1 and field2 are in same row)
    })

    test('Should render action cases data section', () => {
      expect($details('h2.govuk-heading-m').text().trim()).toBe(
        'Action cases data'
      )
      expect($details('h3.govuk-heading-s').text().trim()).toBe(
        'Selected land parcel for action 1'
      )

      const actionTable = $details('table').last()
      expect(actionTable.find('tr')).toHaveLength(3) // Header + 2 data rows (appliedFor is combined)
      expect(actionTable.text()).toContain('100 kg')
      expect(actionTable.text()).toContain('Field A')
      expect(actionTable.text()).toContain('Test notes')
    })
  })
})
