import { casesController } from './controller.js'

export const casesDeprecated = {
  plugin: {
    name: 'cases-deprecated',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/case/{id}/caseDetails',
          handler: casesController.show
        }
      ])
    }
  }
}
