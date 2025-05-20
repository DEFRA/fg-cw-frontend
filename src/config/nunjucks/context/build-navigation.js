/**
 * @param {Partial<Request> | null} request
 */
export function buildNavigation(request) {
  return [
    {
      text: 'Cases',
      url: '/cases',
      isActive: request?.path === '/cases' || request?.path === '/'
    }
  ]
}

/**
 * @import { Request } from '@hapi/hapi'
 */
