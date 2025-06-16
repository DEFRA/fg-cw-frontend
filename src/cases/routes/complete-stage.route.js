import { caseController } from '../controller/case.controller.js'
export const completeStageRoutes = {
  method: 'POST',
  path: '/cases/{caseId}',
  handler: caseController.completeStage
}
