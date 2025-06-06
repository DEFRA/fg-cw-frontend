import { caseController } from './case.controller.js'

export const caseManagement = {
  plugin: {
    name: 'case-management',
    register(server) {
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
