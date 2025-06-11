import { findAllCasesUseCase } from '../use-cases/find-all-cases.use-case.js'
import { findCaseByIdUseCase } from '../use-cases/find-case-by-id.use-case.js'

import { createCaseListViewModel } from '../view-model/case-list.model.js'
import { createCaseDetailViewModel } from '../view-model/case-detail.model.js'

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
  }
}
