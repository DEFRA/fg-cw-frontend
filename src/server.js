import { tracing } from '@defra/hapi-tracing'
import hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import hapiPino from 'hapi-pino'
import hapiPulse from 'hapi-pulse'
import { cases } from './case-management/index.js'
import { casesDeprecated } from './server/cases/index.js'
import { config } from './common/config.js'
import { logger } from './common/logger.js'
import { health } from './health/index.js'
import { nunjucksConfig } from './config/nunjucks/nunjucks.js'

export const createServer = async () => {
  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction: (_request, _h, error) => {
          logger.warn(error, error?.message)
          throw error
        }
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register([
    {
      plugin: hapiPino,
      options: {
        ignorePaths: ['/health'],
        instance: logger
      }
    },
    {
      plugin: tracing.plugin,
      options: {
        tracingHeader: config.get('tracing.header')
      }
    },
    {
      plugin: hapiPulse,
      options: {
        logger,
        timeout: 10_000
      }
    },
    Inert,
    Vision,
    nunjucksConfig
  ])

  await server.register([health, cases, casesDeprecated])

  // Add static file serving
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: '.public',
        redirectToSlash: true,
        index: true
      }
    }
  })

  // Add a redirect from root to cases
  server.route({
    method: 'GET',
    path: '/',
    handler: (_request, h) => h.redirect('/cases')
  })

  return server
}
