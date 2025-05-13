import { applicationsController } from '~/src/server/applications/controller.js'

/**
 * Sets up the routes used in the /applications page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */

export const applications = {
  plugin: {
    name: 'applications',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/applications',
          handler: applicationsController.handler
        },
        {
          method: 'GET',
          path: '/applications/{id}',
          handler: applicationsController.show
        },
        {
          method: 'POST',
          path: '/applications/{id}',
          handler: applicationsController.updateStage
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
