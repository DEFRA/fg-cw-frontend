import { createCaseFromData } from '../../common/helpers/create-case-from-data.js'
import { processCaseWithWorkflow } from '../../common/helpers/process-case-with-workflow.js'

export const createTaskListViewModel = async (caseData, workflow) => {
  const caseAndStageData = processCaseWithWorkflow(
    createCaseFromData(caseData),
    workflow
  )
  return {
    pageTitle: 'Case tasks',
    heading: 'Case',
    breadcrumbs: [],
    data: caseAndStageData
  }
}
