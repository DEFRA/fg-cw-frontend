import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { findOneCaseUseCase } from '../use-cases/find-one-case.use-case.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'
import { createTaskListViewModel } from '../view-model/task-list.model.js'

export const caseController = {
  async listCases(request, h) {
    const cases = await findAllCasesUseCase()
    const viewModel = createCaseListViewModel(cases)
    return h.view('pages/case-list', viewModel)
  },

  async listTasks(request, h) {
    const caseData = await findOneCaseUseCase(request.params.caseId)

    const viewModel = await createTaskListViewModel(caseData)

    return h.view('pages/list-tasks', {
      ...viewModel
    })
  }
}
