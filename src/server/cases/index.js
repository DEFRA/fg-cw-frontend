import { casesController } from '~/src/server/cases/controller.js'

/**
 * Sets up the routes used in the /cases page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */

export const cases = {
  plugin: {
    name: 'cases',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/cases',
          handler: casesController.handler
        },
        {
          method: 'GET',
          path: '/case/{id}',
          handler: casesController.show
        },
        {
          method: 'GET',
          path: '/case/{id}/tasks/{groupId}/{taskId}',
          handler: casesController.showTask
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

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
