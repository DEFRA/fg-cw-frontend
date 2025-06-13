import { createCaseFromData } from '../../common/helpers/create-case-from-data.js'
import { processCaseWithWorkflow } from '../../common/helpers/process-case-with-workflow.js'

export const createTaskDetailViewModel = async (caseData, workflow, query) => {
  const caseAndStageData = processCaseWithWorkflow(
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
