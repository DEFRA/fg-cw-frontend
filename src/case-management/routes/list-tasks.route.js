import { caseController } from '../controller/case.controller.js'
export const listTasksRoutes = {
  method: 'GET',
  path: '/case/{caseId}',
  handler: caseController.listTasks
}
