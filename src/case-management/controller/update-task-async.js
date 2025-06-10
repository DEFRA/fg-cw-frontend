import { createLogger } from '../../server/common/helpers/logging/logger.js'
import { wreck } from '../../server/common/helpers/wreck.js'

export const updateTaskAsync = async ({
  caseId,
  groupId,
  taskId,
  isComplete
}) => {
  try {
    const data = { caseId, groupId, taskId, isComplete }
    return await wreck.post(`/cases/${caseId}/task/`, {
      payload: data
    })
  } catch (e) {
    const logger = createLogger()
    logger.warn('Was unable to update task with id ' + taskId)
  }
}
