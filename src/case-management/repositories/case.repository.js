import { wreck } from '../../server/common/helpers/wreck.js'

const toCase = (data) => ({
  ...data,
  clientRef: data.caseRef,
  code: data.payload?.code
})

export const findAll = async () => {
  try {
    const { payload } = await wreck.get('/cases')
    const cases = payload.data || []
    return cases.map(toCase)
  } catch (error) {
    throw new Error('Failed to fetch cases')
  }
}

export const findById = async (caseId) => {
  try {
    const { payload } = await wreck.get(`/cases/${caseId}`)
    return payload ? toCase(payload) : null
  } catch (error) {
    throw new Error('Failed to fetch case by ID')
  }
}

export const updateStage = async (caseId) => {
  try {
    const { payload } = await wreck.post(`/cases/${caseId}/stage`)
    return payload ? toCase(payload) : null
  } catch (error) {
    throw new Error('Failed to update case stage')
  }
}
