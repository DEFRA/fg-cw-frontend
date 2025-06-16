import { wreck } from '../../server/common/helpers/wreck.js'

export const findAll = async () => {
  const { payload } = await wreck.get('/cases')
  return payload
}

export const findById = async (caseId) => {
  const { payload } = await wreck.get(`/cases/${caseId}`)
  return payload
}

export const completeTask = async ({ caseId, groupId, taskId, isComplete }) => {
  const data = { caseId, groupId, taskId, isComplete }
  return await wreck.post(`/cases/${caseId}/task/`, {
    payload: data
  })
}

export const completeStage = async (caseId) => {
  try {
    await wreck.post(`/cases/${caseId}/stage`)
  } catch (e) {
    if (e.data?.payload) {
      return { error: e.data.payload }
    }
    return { error: 'Update failed' }
  }
}
