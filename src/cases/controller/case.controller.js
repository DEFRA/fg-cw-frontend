import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { findCaseByIdUseCase } from '../use-cases/find-case-by-id.use-case.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'
import { createCaseDetailViewModel } from '../view-model/case-detail.model.js'
import { createTaskListViewModel } from '../view-model/task-list.model.js'
import { createTaskDetailViewModel } from '../view-model/task-detail.model.js'
import { findWorkflowByCode } from '../repositories/workflow.repository.js'
import {
  updateTaskStatus,
  completeStage
} from '../repositories/case.repository.js'

export const caseController = {
  async listCases(request, h) {
    const cases = await findAllCasesUseCase()
    const viewModel = createCaseListViewModel(cases)
    return h.view('pages/case-list', viewModel)
  },
  async getCase(request, h) {
    const { caseId } = request.params
    const caseData = await findCaseByIdUseCase(caseId)
    const viewModel = createCaseDetailViewModel(caseData)

    return h.view('pages/case-detail', viewModel)
  },
  async listTasks(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.caseId)
    const workflow = await findWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskListViewModel(caseData, workflow)
    return h.view('pages/task-list', {
      ...viewModel
    })
  },
  async getTask(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.caseId)
    const workflow = await findWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskDetailViewModel(
      caseData,
      workflow,
      request.params
    )
    return h.view('pages/task-detail', viewModel)
  },
  async updateTaskStatus(request, h) {
    const { caseId, groupId } = request.params
    const { isComplete = false, taskId } = request.payload

    const { currentStage } = await findCaseByIdUseCase(caseId)

    await updateTaskStatus({
      caseId,
      stageId: currentStage,
      groupId,
      taskId,
      isComplete: !!isComplete
    })

    const params = { groupId, taskId }
    const caseData = await findCaseByIdUseCase(caseId)
    const workflow = await findWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskDetailViewModel(
      caseData,
      workflow,
      params
    )
    return h.view('pages/task-detail', viewModel)
  },
  async completeStage(request, h) {
    const {
      params: { caseId }
    } = request
    const result = await completeStage(caseId)

    const caseData = await findCaseByIdUseCase(caseId)
    const workflow = await findWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskListViewModel(
      caseData,
      workflow,
      result?.error
    )
    return h.view('pages/task-list', {
      ...viewModel
    })
  }
}
