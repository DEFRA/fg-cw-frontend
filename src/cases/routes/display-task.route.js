import { caseController } from '../controller/case.controller.js'
export const displayTaskRoutes = {
  method: 'GET',
  path: '/cases/{id}/tasks/{groupId}/{taskId}',
  handler: caseController.getTask
}
