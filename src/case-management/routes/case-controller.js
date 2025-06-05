import { findAllCasesUseCase } from '../use-cases/find-all-cases.js'
import { createCaseListViewModel } from '../view-model/case-list.model.js'

export const caseController = {
  async listCases(request, h) {
    const cases = await findAllCasesUseCase()
    const viewModel = createCaseListViewModel(cases)

    return h.view('pages/case-list', viewModel)
  }
}
