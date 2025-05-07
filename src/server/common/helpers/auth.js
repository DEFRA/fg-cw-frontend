import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'

import { config } from '~/src/config/config.js'

export const auth = {
  plugin: {
    name: 'auth',
    async register(server) {
      if (!config.get('auth.enabled')) {
        server.logger.info('Auth is disabled')
        return
      }

      await server.register([Cookie, Bell])

      // server.auth.strategy('session', 'cookie', {
      //   cookie: {
      //     name: 'session-auth',
      //     password: config.get('session.cookie.password'),
      //     ttl: config.get('session.cookie.ttl'),
      //     path: '/',
      //     isSecure: config.get('session.cookie.secure'),
      //     isSameSite: 'Strict'
      //   },
      //   keepAlive: true, // Resets the cookie ttl after each route
      //   redirectTo: '/login'
      // })

      server.auth.strategy('msEntraId', 'bell', {
        provider: 'azure',
        password: config.get('session.cookie.password'),
        clientId: config.get('auth.msEntraId.clientId'),
        clientSecret: config.get('auth.msEntraId.clientSecret'),
        scope: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
        config: {
          tenant: config.get('auth.msEntraId.tenantId')
        },
        location(request) {
          return `http://${request.info.host}/login/callback`
        },
        isSecure: config.get('isProduction')
      })

      // server.auth.default('session')

      server.route({
        method: ['GET', 'POST'],
        path: '/login/callback',
        options: {
          auth: {
            mode: 'try',
            strategy: 'msEntraId'
          },
          handler: function (request, h) {
            if (!request.auth.isAuthenticated) {
              return `Authentication failed due to: ${request.auth.error.message}`
            }

            console.log('Authenticated:', JSON.stringify(request.auth, null, 2))

            // Perform any account lookup or registration, setup local session,
            // and redirect to the application. The third-party credentials are
            // stored in request.auth.credentials. Any query parameters from
            // the initial request are passed back via request.auth.credentials.query.

            return h.redirect('/')
          }
        }
      })
    }
  }
}
