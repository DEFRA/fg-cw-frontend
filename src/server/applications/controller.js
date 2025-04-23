/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */

import { fetch } from 'undici'
import { config } from '../../config/config.js'

const getCases = async () => {
  try {
    const backendUrl = config.get('fg_cw_backend_url')
    const response = await fetch(`${backendUrl.toString()}/cases`)
    const { data } = await response.json()
    return data
  } catch (error) {
    return []
  }
}

const getCaseById = async (caseId) => {
  try {
    const backendUrl = config.get('fg_cw_backend_url')
    const response = await fetch(`${backendUrl.toString()}/cases/${caseId}`)
    const data = await response.json()
    return data
  } catch (error) {
    return null
  }
}

export const applicationsController = {
  handler: async (_request, h) => {
    const caseData = await getCases()
    return h.view('applications/index', {
      pageTitle: 'Applications',
      heading: 'Applications',
      breadcrumbs: [{ text: 'Home', href: '/' }, { text: 'Applications' }],
      data: { allCases: caseData }
    })
  },

  show: async (request, h) => {
    const caseId = request.params.id
    const selectedCase = await getCaseById(caseId)

    if (!selectedCase) {
      return h.response('Case not found').code(404)
    }

    return h.view('applications/show', {
      pageTitle: 'Case Detail',
      heading: selectedCase.businessName || 'Case Detail',
      caseData: selectedCase
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
