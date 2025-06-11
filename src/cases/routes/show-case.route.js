import { caseController } from '../controller/case.controller.js'

export const showCaseRoutes = {
  method: 'GET',
  path: '/cases/{caseId}/case-details',
  handler: caseController.getCase
}
