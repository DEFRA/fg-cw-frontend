import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { findCaseByIdUseCase } from '../use-cases/find-case-by-id.use-case.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'
import { createTaskListViewModel } from '../view-model/task-list.model.js'
import { createTaskDetailViewModel } from '../view-model/task-detail.model.js'
import { getWorkflowByCode } from '../repositories/workflow.repository.js'

export const caseController = {
  async listCases(request, h) {
    const cases = await findAllCasesUseCase()
    const viewModel = createCaseListViewModel(cases)
    return h.view('pages/case-list', viewModel)
  },

  async listTasks(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.id)
    const workflow = await getWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskListViewModel(caseData, workflow)
    return h.view('pages/task-list', {
      ...viewModel
    })
  },

  async displayTask(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.id)
    const workflow = await getWorkflowByCode(caseData.workflowCode)
    const viewModel = await createTaskDetailViewModel(
      caseData,
      workflow,
      request.params
    )
    return h.view('pages/task-detail', viewModel)
  }
}
