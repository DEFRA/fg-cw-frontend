import { caseController } from '../controller/case.controller.js'
export const updateTaskStatusRoutes = {
  method: 'POST',
  path: '/cases/{caseId}/tasks/{groupId}/{taskId}',
  handler: caseController.updateTaskStatus
}
