import { casesRoutes } from './routes/case.js'

export const cases = {
  plugin: {
    name: 'cases',
    async register(server, _options) {
      await server.register([casesRoutes])
    }
  }
}
