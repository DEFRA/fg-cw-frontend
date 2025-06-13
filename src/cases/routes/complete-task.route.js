import { caseController } from '../controller/case.controller.js'
export const completeTaskRoutes = {
  method: 'POST',
  path: '/cases/{caseId}/tasks/{groupId}/{taskId}',
  handler: caseController.completeTask
}
