import inert from '@hapi/inert'

import { health } from './health/index.js'
import { serveStaticFiles } from './server/common/helpers/serve-static-files.js'
import { caseManagement } from './case-management/routes/index.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Domain specific routes
      await server.register([caseManagement])

      // Add a redirect from root to cases
      server.route({
        method: 'GET',
        path: '/',
        handler: (_request, h) => h.redirect('/cases')
      })

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
