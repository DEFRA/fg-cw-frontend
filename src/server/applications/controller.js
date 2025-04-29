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

const buildTaskSteps = (selectedCase) => {
  const groupedTaskIds = new Set()

  const taskSteps = (selectedCase.taskSections || []).map((section) => {
    const tasks = (section.taskGroups || []).map((group) => {
      groupedTaskIds.add(group.id)
      return {
        label: group.title,
        link: `/cases/${selectedCase.caseRef}/task-group/${group.id}`,
        status: group.status
      }
    })

    return {
      heading: section.title,
      tasks
    }
  })

  const ungrouped = (selectedCase.taskGroups || []).filter(
    (group) => !groupedTaskIds.has(group.id)
  )

  if (ungrouped.length > 0) {
    taskSteps.push({
      heading: 'Other tasks',
      tasks: ungrouped.map((group) => ({
        label: group.title,
        link: `/cases/${selectedCase.caseRef}/task-group/${group.id}`,
        status: group.status
      }))
    })
  }

  return taskSteps
}

export const applicationsController = {
  handler: async (_request, h) => {
    const caseData = await getCases()
    return h.view('applications/views/index', {
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

    const taskSteps = buildTaskSteps(selectedCase)

    return h.view('applications/views/show', {
      pageTitle: 'Case Detail',
      heading: selectedCase.businessName || 'Case Detail',
      caseData: selectedCase,
      taskSteps
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
