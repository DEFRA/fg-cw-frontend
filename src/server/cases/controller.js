import { wreck } from '../common/helpers/wreck.js'
import { updateTaskAsync } from '../../case-management/controller/update-task-async.js'
import {
  getCaseById,
  getProcessedCaseData
} from '../../case-management/controller/helpers.js'
import { showStage } from '../../case-management/controller/show-stage.controller.js'
const getCases = async () => {
  try {
    const { payload } = await wreck.get('/cases')
    return payload.data
  } catch {
    return []
  }
}

const updateStageAsync = async (caseId) => {
  try {
    const { payload } = await wreck.post(`/cases/${caseId}/stage`)
    return payload
  } catch (e) {
    if (e.data?.payload) {
      return { error: e.data.payload }
    }
    return { error: 'Update failed' }
  }
}

const showCase = async (request, h, error) => {
  let processedData
  try {
    processedData = await getProcessedCaseData(request)
  } catch (error) {
    return h.response(error.message).code(404)
  }

  return h.view('cases/views/show', {
    pageTitle: 'Case details',
    ...processedData,
    error,
    query: request.path.includes('/caseDetails')
      ? { tab: 'caseDetails' }
      : request.query
  })
}

const showTask = async (request, h) => {
  let processedData
  try {
    processedData = await getProcessedCaseData(request)
  } catch (error) {
    return h.response(error.message).code(404)
  }
  const { groupId, taskId } = request.params
  const currentGroup = processedData.stage.groups.find((g) => g.id === groupId)
  const currentGroupTasks = currentGroup?.tasks

  const currentTask = currentGroupTasks.find((t) => t.id === taskId)

  processedData.currentTask = currentTask

  return h.view('cases/views/stage', {
    pageTitle: 'Case',
    ...processedData,
    query: { groupId, taskId }
  })
}

export const casesController = {
  handler: async (request, h) => {
    const caseData = await getCases()
    return h.view('cases/views/index', {
      pageTitle: 'Cases',
      heading: 'Cases',
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

    // call backend with stage update
    const response = await updateStageAsync(id)
    // redirect to stage/tasks
    return showStage(request, h, response.error)
  },

  show: showCase,
  showTask,
  showStage,
  completeTask: async (request, h) => {
    const { id, groupId } = request.params

    const selectedCase = await getCaseById(id)

    if (!selectedCase) {
      return h.response('Case not found').code(404)
    }

    const { isComplete = false, taskId } = request.payload

    await updateTaskAsync({
      caseId: id,
      groupId,
      taskId,
      isComplete: !!isComplete
    })

    return showStage(request, h)
  }
}
