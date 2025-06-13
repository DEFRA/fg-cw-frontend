import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { findCaseByIdUseCase } from '../use-cases/find-case-by-id.use-case.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'
import { createCaseDetailViewModel } from '../view-model/case-detail.model.js'
import { createTaskListViewModel } from '../view-model/task-list.model.js'
import { createTaskDetailViewModel } from '../view-model/task-detail.model.js'
import { findWorkflowByCode } from '../repositories/workflow.repository.js'
import { completeTask } from '../repositories/case.repository.js'

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
  async completeTask(request, h) {
    const { caseId, groupId } = request.params
    const { isComplete = false, taskId } = request.payload

    await completeTask({
      caseId,
      groupId,
      taskId,
      isComplete: !!isComplete
    })

    const query = {
      groupId,
      taskId
    }

    const caseData = await findCaseByIdUseCase(request.params.caseId)
    const workflow = await findWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskDetailViewModel(caseData, workflow, query)
    return h.view('pages/task-detail', viewModel)
  }
}
