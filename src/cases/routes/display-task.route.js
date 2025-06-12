import { caseController } from '../controller/case.controller.js'
export const displayTaskRoute = {
  method: 'GET',
  path: '/cases/{id}/tasks/{groupId}/{taskId}',
  handler: caseController.displayTask
}
