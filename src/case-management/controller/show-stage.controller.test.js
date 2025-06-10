import { describe, it, expect, vi } from 'vitest'
import { showStage } from './show-stage.controller.js'
import { getProcessedCaseData } from './helpers.js'

vi.mock('./helpers.js', () => ({
  getProcessedCaseData: vi.fn()
}))

function mockRequest(options = {}) {
  return {
    params: {},
    payload: {},
    query: {},
    path: '/',
    ...options
  }
}

function mockResponseToolkit(options = {}) {
  const toolkit = {
    view: vi.fn().mockReturnThis(),
    response: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis(),
    ...options
  }
  return toolkit
}

describe('showTask', () => {
  const mockCase = {
    _id: 'case123',
    workflowCode: 'workflow1',
    currentStage: 'stage1',
    stages: [
      {
        id: 'stage1',
        taskGroups: [
          {
            id: 'group1',
            tasks: [{ id: 'task1', isComplete: false }]
          }
        ]
      }
    ]
  }

  it('Should return task view with correct query parameters', async () => {
    getProcessedCaseData.mockResolvedValueOnce({
      caseData: { ...mockCase },
      stage: {
        title: 'foo title'
      },
      query: {
        groupId: 'group1',
        taskId: 'task1'
      }
    })

    const request = mockRequest({
      params: { id: 'case123', groupId: 'group1', taskId: 'task1' }
    })
    const h = mockResponseToolkit()

    await showStage(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'cases/views/stage',
      expect.objectContaining({
        pageTitle: 'Case - foo title',
        query: { groupId: 'group1', taskId: 'task1' }
      })
    )
  })

  it('Should return 404 when case is not found', async () => {
    getProcessedCaseData.mockRejectedValueOnce(new Error('Not Found'))

    const request = mockRequest({
      params: { id: 'nonexistent', groupId: 'group1', taskId: 'task1' }
    })
    const h = mockResponseToolkit()

    await showStage(request, h)

    expect(h.response).toHaveBeenCalledWith('Not Found')
    expect(h.code).toHaveBeenCalledWith(404)
  })
})
