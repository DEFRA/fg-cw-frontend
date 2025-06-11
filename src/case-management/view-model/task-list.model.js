import { getFormattedGBDate } from '../../common/helpers/date-helpers.js'
import { getWorkflowByCode } from '../repositories/workflow.repository.js'

export const transformCase = (caseData) => {
  return {
    id: caseData._id,
    clientRef: caseData.clientRef,
    workflowCode: caseData.code,
    submittedAt: getFormattedGBDate(caseData.submittedAt),
    status: caseData.status,
    assignedUser: caseData.assignedUser,
    link: `/case/${caseData._id}`,
    stages: caseData.stages,
    currentStage: caseData.currentStage
  }
}

export const processCaseWithWorkflow = async (selectedCase) => {
  if (!selectedCase) {
    return null
  }

  const { workflowCode } = selectedCase
  if (!workflowCode) {
    return null
  }

  const workflow = await getWorkflowByCode(workflowCode)
  if (!workflow) {
    return null
  }

  // Add titles from workflow stages to selectedCase stages
  selectedCase.stages = selectedCase.stages.map((stage) => {
    const workflowStage = workflow.stages.find((ws) => ws.id === stage.id)

    // Add title from workflow to the stage
    const updatedStage = {
      ...stage,
      title: workflowStage?.title
    }

    // Add titles to task groups
    if (stage.taskGroups && stage.taskGroups.length > 0) {
      updatedStage.taskGroups = stage.taskGroups.map((taskGroup) => {
        const workflowTaskGroup = workflowStage?.taskGroups?.find(
          (wtg) => wtg.id === taskGroup.id
        )

        // Add title to task group
        const updatedTaskGroup = {
          ...taskGroup,
          title: workflowTaskGroup?.title
        }

        // Add titles to tasks
        if (taskGroup.tasks && taskGroup.tasks.length > 0) {
          updatedTaskGroup.tasks = taskGroup.tasks.map((task) => {
            const workflowTask = workflowTaskGroup?.tasks?.find(
              (wt) => wt.id === task.id
            )

            // Add title to task
            return {
              ...task,
              title: workflowTask?.title,
              type: workflowTask?.type
            }
          })
        }

        return updatedTaskGroup
      })
    }

    if (workflowStage.actions) {
      updatedStage.actions = workflowStage.actions
    }

    return updatedStage
  })

  // Create taskSteps from the updated selectedCase stages
  const stages =
    selectedCase.stages.map((stage) => ({
      title: stage.title || stage.id,
      actions: stage.actions,
      groups: (stage.taskGroups || []).map((group) => ({
        ...group,
        tasks: (group.tasks || []).map((task) => ({
          ...task,
          link: `/case/${selectedCase._id}/tasks/${group.id}/${task.id}`,
          status: task.isComplete ? 'COMPLETE' : 'INCOMPLETE'
        }))
      }))
    })) || []

  // Filter stages to only show the current stage
  const currentStage = selectedCase.currentStage

  const stageIndex = selectedCase.stages.findIndex(
    (stage) => stage.id === currentStage
  )
  const filteredStage = stageIndex >= 0 ? stages[stageIndex] : null

  return {
    case: selectedCase,
    stage: filteredStage
  }
}

export const createTaskListViewModel = async (caseData) => {
  const transformedCase = await processCaseWithWorkflow(transformCase(caseData))
  return {
    pageTitle: 'Case tasks',
    heading: 'Case',
    breadcrumbs: [],
    data: transformedCase
  }
}
