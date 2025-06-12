import { caseController } from '../controller/case.controller.js'
export const listTasksRoutes = {
  method: 'GET',
  path: '/cases/{id}',
  handler: caseController.listTasks
}
