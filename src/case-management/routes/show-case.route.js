import { caseController } from '../controller/case.controller.js'

export const showCaseRoutes = {
  method: 'GET',
  path: '/cases/{caseId}',
  handler: caseController.getCase
}
