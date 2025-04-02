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
          ...applicationsController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
