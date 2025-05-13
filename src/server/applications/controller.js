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

const updateStageAsync = async (caseId, nextStage) => {
  try {
    const backendUrl = config.get('fg_cw_backend_url')
    const response = await fetch(
      `${backendUrl.toString()}/cases/${caseId}/stage`,
      {
        method: 'POST',
        data: {
          nextStage
        }
      }
    )
    const data = await response.json()
    return data
  } catch {
    return null
  }
}

const showApplication = async (request, h) => {
  const caseId = request.params.id
  const selectedCase = await getCaseById(caseId)

  if (!selectedCase) {
    return h.response('Case not found').code(404)
  }
  const { workflowCode } = selectedCase

  if (!workflowCode) {
    return h.response('Workflow not found').code(404)
  }
  const workflow = await getWorkflowByCode(workflowCode)

  // Add titles from workflow stages to selectedCase stages
  selectedCase.stages = selectedCase.stages.map((stage) => {
    const workflowStage = workflow.stages.find((ws) => ws.id === stage.id)

    // Add title from workflow to the stage
    const updatedStage = {
      ...stage,
      title: workflowStage.title
    }

    // Add titles to task groups
      updatedStage.taskGroups = stage.taskGroups.map((taskGroup) => {
        const workflowTaskGroup = workflowStage.taskGroups.find(
          (wtg) => wtg.id === taskGroup.id
        )

        // Add title to task group
        const updatedTaskGroup = {
          ...taskGroup,
          title: workflowTaskGroup.title
        }

        // Add titles to tasks
          updatedTaskGroup.tasks = taskGroup.tasks.map((task) => {
            const workflowTask = workflowTaskGroup.tasks.find(
              (wt) => wt.id === task.id
            )

            // Add title to task
            return {
              ...task,
              title: workflowTask.title,
              type: workflowTask.type
            }
          })
        }

        return updatedTaskGroup
      })
    }

    // Add labels to actions
    if (stage.actions && stage.actions.length > 0) {
      updatedStage.actions = stage.actions.map((action) => {
        const workflowAction = workflowStage?.actions?.find(
          (wa) => wa.id === action.id
        )

        // Add label to action
        return {
          ...action,
          label: workflowAction?.label
        }
      })
    }

    return updatedStage
  })

  // Create taskSteps from the updated selectedCase stages
  const stages =
    selectedCase.stages.map((stage) => ({
      title: stage.title || stage.id,
      actions: stage.actions,
      groups: (stage.taskGroups || []).map((group) => ({
        ...group,
        tasks: (group.tasks || []).map((task) => ({
          ...task,
          link: `/applications/${caseId}?tab=tasks&groupId=${group.id}&taskId=${task.id}`,
          status: task.isComplete ? 'COMPLETE' : 'INCOMPLETE'
        }))
      }))
    })) || []

  // Filter stages to only show the current stage
  const currentStage = selectedCase.currentStage

  // Get the matching stage directly
  const stageIndex = selectedCase.stages.findIndex(
    (stage) => stage.id === currentStage
  )
  const filteredStage = stageIndex >= 0 ? stages[stageIndex] : null

  return h.view('applications/views/show', {
    pageTitle: 'Application',
    caseData: selectedCase,
    stage: filteredStage,
    query: request.query
  })
}

const getWorkflowByCode = async (workflowCode) => {
  try {
    const backendUrl = config.get('fg_cw_backend_url')
    const response = await fetch(
      `${backendUrl.toString()}/workflows/${workflowCode}`
    )
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

  updateStage: async (request, h) => {
    const { id } = request.params

    const selectedCase = await getCaseById(id)

    if (!selectedCase) {
      return h.response('Case not found').code(404)
    }

    const { nextStage } = request.payload

    await updateStageAsync(id, nextStage)
    // call backend with stage update
    // redirect to stage
    return showApplication(request, h)
  },

  show: showApplication
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
