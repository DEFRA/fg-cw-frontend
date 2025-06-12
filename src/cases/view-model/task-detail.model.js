import { createCaseFromData } from '../../common/helpers/createCaseFromData.js'
import { processCaseWithWorkflow } from '../../common/helpers/processCaseWithWorkflow.js'

export const createTaskDetailViewModel = async (caseData, workflow, query) => {
  const caseAndStageData = await processCaseWithWorkflow(
    createCaseFromData(caseData),
    workflow
  )

  return {
    pageTitle: 'Case task',
    heading: 'Case',
    breadcrumbs: [],
    data: {
      ...caseAndStageData,
      taskId: query.taskId,
      groupId: query.groupId
    }
  }
}
