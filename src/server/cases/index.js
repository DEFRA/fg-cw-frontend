import { casesController } from './controller.js'

export const casesDeprecated = {
  plugin: {
    name: 'casesDeprecated',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/case/{id}',
          handler: casesController.showStage
        },
        {
          method: 'GET',
          path: '/case/{id}/tasks/{groupId}/{taskId}',
          handler: casesController.showTask
        },
        {
          method: 'POST',
          path: '/case/{id}/tasks/{groupId}/{taskId}',
          handler: casesController.completeTask
        },
        {
          method: 'GET',
          path: '/case/{id}/caseDetails',
          handler: casesController.show
        },
        {
          method: 'POST',
          path: '/case/{id}',
          handler: casesController.updateStage
        }
      ])
    }
  }
}
