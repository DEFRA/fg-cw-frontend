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
  } catch {
    return []
  }
}

const getCaseById = async (caseId) => {
  try {
    const backendUrl = config.get('fg_cw_backend_url')
    const response = await fetch(`${backendUrl.toString()}/cases/${caseId}`)
    const data = await response.json()
    return data
  } catch {
    return null
  }
}

export const applicationsController = {
  handler: async (_request, h) => {
    const caseData = await getCases()
    return h.view('applications/views/index', {
      pageTitle: 'Applications',
      heading: 'Applications',
      breadcrumbs: [],
      data: { allCases: caseData }
    })
  },

  show: async (request, h) => {
    const caseId = request.params.id
    const selectedCase = await getCaseById(caseId)

    if (!selectedCase) {
      return h.response('Case not found').code(404)
    }

    const taskSteps =
      selectedCase.taskSections?.map((section) => ({
        heading: section.title,
        tasks: (section.taskGroups || []).map((group) => ({
          label: group.title,
          link: `/cases/${selectedCase.caseRef}/task-group/${group.id}`,
          status: group.status
        }))
      })) || []

    const tasks = selectedCase.tasks

    return h.view('applications/views/show', {
      pageTitle: 'Application',
      caseData: selectedCase,
      taskSteps,
      tasks
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
