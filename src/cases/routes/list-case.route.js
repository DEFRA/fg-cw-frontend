import { caseController } from '../controller/case.controller.js'

export const listCasesRoutes = {
  method: 'GET',
  path: '/cases',
  handler: caseController.listCases
}
