import { statusCodes } from '../server/common/constants/status-codes.js'

export const healthController = {
  handler(_request, h) {
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}
