import { listCasesRoutes } from './routes/list-case.route.js'

export const cases = {
  plugin: {
    name: 'cases',
    async register(server, _options) {
      await server.route([listCasesRoutes])
    }
  }
}
