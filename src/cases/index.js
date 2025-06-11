import { listCasesRoutes } from './routes/list-case.route.js'
import { listTasksRoutes } from './routes/list-tasks.route.js'
import { showCaseRoutes } from './routes/show-case.route.js'

export const cases = {
  plugin: {
    name: 'cases',
    async register(server, _options) {
      await server.route([listCasesRoutes, showCaseRoutes, listTasksRoutes])
    }
  }
}
