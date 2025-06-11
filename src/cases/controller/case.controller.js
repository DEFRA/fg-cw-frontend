import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'

export const caseController = {
  async listCases(request, h) {
    const cases = await findAllCasesUseCase()
    const viewModel = createCaseListViewModel(cases)
    return h.view('pages/case-list', viewModel)
  },

  async listTasks(request, h) {
    return h.view('pages/list-tasks', {
      case: {},
      caseDataId: '0987',
      active: true
    })
  }
}
