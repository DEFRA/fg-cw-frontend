/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
import { getRequestId } from '../common/helpers/getRequestId.js'
import { wreck } from '../common/helpers/wreck.js'

const getCases = async (requestId) => {
  try {
    const { data } = await wreck({ uri: '/cases' }, requestId)
    return data
  } catch {
    return []
  }
}

const getCaseById = async (caseId, requestId) => {
  try {
    return wreck({ uri: `/cases/${caseId}` }, requestId)
  } catch (error) {
    return null
  }
}

const updateStageAsync = async (caseId, nextStage, requestId) => {
  try {
    return wreck(
      {
        uri: `/case/${caseId}/stage`,
        method: 'POST',
        payload: JSON.stringify({ nextStage })
      },
      requestId
    )
  } catch {
    return null
  }
}

const getWorkflowByCode = async (workflowCode, requestId) => {
  try {
    return wreck({ uri: `/workflows/${workflowCode}` }, requestId)
  } catch {
    return null
  }
}

const processCaseWithWorkflow = async (selectedCase, requestId) => {
  if (!selectedCase) {
    return null
  }

  const { workflowCode } = selectedCase
  if (!workflowCode) {
    return null
  }

  const workflow = await getWorkflowByCode(workflowCode, requestId)
  if (!workflow) {
    return null
  }

  // Add titles from workflow stages to selectedCase stages
  selectedCase.stages = selectedCase.stages.map((stage) => {
    const workflowStage = workflow.stages.find((ws) => ws.id === stage.id)

    // Add title from workflow to the stage
    const updatedStage = {
      ...stage,
      title: workflowStage?.title
    }

    // Add titles to task groups
    if (stage.taskGroups && stage.taskGroups.length > 0) {
      updatedStage.taskGroups = stage.taskGroups.map((taskGroup) => {
        const workflowTaskGroup = workflowStage?.taskGroups?.find(
          (wtg) => wtg.id === taskGroup.id
        )

        // Add title to task group
        const updatedTaskGroup = {
          ...taskGroup,
          title: workflowTaskGroup?.title
        }

        // Add titles to tasks
        if (taskGroup.tasks && taskGroup.tasks.length > 0) {
          updatedTaskGroup.tasks = taskGroup.tasks.map((task) => {
            const workflowTask = workflowTaskGroup?.tasks?.find(
              (wt) => wt.id === task.id
            )

            // Add title to task
            return {
              ...task,
              title: workflowTask?.title,
              type: workflowTask?.type
            }
          })
        }

        return updatedTaskGroup
      })
    }

    if (workflowStage.actions) {
      updatedStage.actions = workflowStage.actions
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
          link: `/case/${selectedCase._id}/tasks/${group.id}/${task.id}`,
          status: task.isComplete ? 'COMPLETE' : 'INCOMPLETE'
        }))
      }))
    })) || []

  // Filter stages to only show the current stage
  const currentStage = selectedCase.currentStage
  const stageIndex = selectedCase.stages.findIndex(
    (stage) => stage.id === currentStage
  )
  const filteredStage = stageIndex >= 0 ? stages[stageIndex] : null

  return {
    caseData: selectedCase,
    stage: filteredStage
  }
}

const showCase = async (request, h) => {
  const caseId = request.params.id
  const selectedCase = await getCaseById(caseId, getRequestId(request))

  if (!selectedCase) {
    return h.response('Case not found').code(404)
  }

  const processedData = await processCaseWithWorkflow(
    selectedCase,
    getRequestId(request)
  )
  if (!processedData) {
    return h.response('Workflow not found').code(404)
  }

  return h.view('cases/views/show', {
    pageTitle: 'Case',
    ...processedData,
    query: request.path.includes('/caseDetails')
      ? { tab: 'caseDetails' }
      : request.query
  })
}

const showTask = async (request, h) => {
  const { id, groupId, taskId } = request.params

  if (!id) {
    return h.response('Case ID is required').code(400)
  }

  const requestId = getRequestId(request)

  const selectedCase = await getCaseById(id, requestId)

  if (!selectedCase) {
    return h.response('Case not found').code(404)
  }

  const processedData = await processCaseWithWorkflow(selectedCase, requestId)
  if (!processedData) {
    return h.response('Workflow not found').code(404)
  }

  return h.view('cases/views/show', {
    pageTitle: 'Case',
    ...processedData,
    query: { groupId, taskId }
  })
}

export const casesController = {
  handler: async (request, h) => {
    const caseData = await getCases(getRequestId(request))
    return h.view('cases/views/index', {
      pageTitle: 'Cases',
      heading: 'Cases',
      breadcrumbs: [],
      data: { allCases: caseData }
    })
  },

  updateStage: async (request, h) => {
    const { id } = request.params

    const selectedCase = await getCaseById(id, getRequestId(request))

    if (!selectedCase) {
      return h.response('Case not found').code(404)
    }

    const { nextStage } = request.payload

    // call backend with stage update
    await updateStageAsync(id, nextStage, getRequestId(request))
    // redirect to stage
    return showCase(request, h)
  },

  show: showCase,
  showTask
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
