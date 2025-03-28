/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const applicationsController = {
  handler(_request, h) {
    return h.view('applications/index', {
      pageTitle: 'Applications',
      heading: 'Applications',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Applications'
        }
      ]
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
