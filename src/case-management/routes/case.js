import { caseController } from '../controller/case.controller.js'

export const casesRoutes = {
  plugin: {
    name: 'case-management',
    async register(server) {
      server.route([
        {
          method: 'GET',
          path: '/cases',
          handler: caseController.listCases
        }
        // Future routes for case details, etc. will be added here in next PRs
      ])
    }
  }
}
