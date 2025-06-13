import { caseController } from '../controller/case.controller.js'
export const displayTaskRoutes = {
  method: 'GET',
  path: '/cases/{caseId}/tasks/{groupId}/{taskId}',
  handler: caseController.getTask
}
