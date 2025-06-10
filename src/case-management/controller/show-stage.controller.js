import { getProcessedCaseData } from './helpers.js'
export const showStage = async (request, h, error) => {
  let processedData
  try {
    processedData = await getProcessedCaseData(request)
  } catch (error) {
    return h.response(error.message).code(404)
  }
  return h.view('cases/views/stage', {
    pageTitle: 'Case - ' + processedData.stage.title,
    ...processedData,
    error
  })
}
