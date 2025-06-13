import { createCaseFromData } from '../../common/helpers/create-case-from-data.js'
import { processCaseWithWorkflow } from '../../common/helpers/process-case-with-workflow.js'

export const createTaskDetailViewModel = async (caseData, workflow, query) => {
  const caseAndStageData = processCaseWithWorkflow(
    createCaseFromData(caseData),
    workflow
  )

  const { groupId, taskId } = query
  const currentGroup = caseAndStageData.stage.groups.find(
    (g) => g.id === groupId
  )
  const currentGroupTasks = currentGroup?.tasks
  const currentTask = currentGroupTasks.find((t) => t.id === taskId)

  return {
    pageTitle: 'Case task - ' + currentTask.title,
    heading: 'Case',
    breadcrumbs: [
      { text: 'Cases', href: '/cases' },
      { text: caseData.caseRef, href: '/cases/' + caseData._id }
    ],
    data: {
      ...caseAndStageData,
      taskId: query.taskId,
      groupId: query.groupId,
      currentTask
    }
  }
}
