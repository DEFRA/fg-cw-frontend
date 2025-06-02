export function buildNavigation(request) {
  return [
    {
      text: 'Cases',
      url: '/cases',
      isActive: request?.path === '/cases' || request?.path === '/'
    }
  ]
}
