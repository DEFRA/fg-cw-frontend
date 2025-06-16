import { createCaseFromData } from '../../common/helpers/create-case-from-data.js'
import { processCaseWithWorkflow } from '../../common/helpers/process-case-with-workflow.js'

export const createTaskListViewModel = async (caseData, workflow, error) => {
  const caseAndStageData = processCaseWithWorkflow(
    createCaseFromData(caseData),
    workflow
  )
  const pageTitle =
    (error ? 'Error ' : '') + 'Case tasks - ' + caseAndStageData.stage.title

  return {
    pageTitle,
    heading: 'Case',
    breadcrumbs: [
      { text: 'Cases', href: '/cases' },
      { text: caseData.caseRef }
    ],
    data: caseAndStageData,
    error: error?.message
  }
}
