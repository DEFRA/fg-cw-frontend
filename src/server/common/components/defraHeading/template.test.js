import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Heading Component', () => {
  let $defraHeading

  describe('defra heading', () => {
    beforeEach(() => {
      $defraHeading = renderComponent('defraHeading', {
        serviceName: 'Manage rural grant applications'
      })
    })

    test('Should render defra heading component', () => {
      expect(
        $defraHeading('[data-testid="defra-heading-logo"]').text().trim()
      ).toContain('Departmentfor Environment,Food & Rural Affairs')

      expect(
        $defraHeading('[data-testid="defra-heading-service-name"]')
          .text()
          .trim()
      ).toContain('Manage rural grant applications')
    })
  })
})

/**
 * @import { CheerioAPI } from 'cheerio'
 */
