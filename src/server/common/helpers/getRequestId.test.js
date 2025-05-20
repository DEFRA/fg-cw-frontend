import { getRequestId } from './getRequestId.js'

describe('getRequestId', () => {
  test('should get id from request.info', () => {
    const id = 'ABCD-0987'
    const request = {
      info: {
        id
      }
    }
    expect(getRequestId(request)).toEqual(id)
  })
})
