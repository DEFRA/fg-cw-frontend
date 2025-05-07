/**
 * @param {Partial<Request> | null} request
 */
export function buildNavigation(request) {
  return [
    {
      text: 'Applications',
      url: '/applications',
      isActive: request?.path === '/applications' || request?.path === '/'
    }
  ]
}

/**
 * @import { Request } from '@hapi/hapi'
 */
