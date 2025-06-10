import { expect, describe, it, vi, afterEach, afterAll } from 'vitest'
import { updateTaskAsync } from './update-task-async.js'
import { wreck } from '../../server/common/helpers/wreck.js'
import { createLogger } from '../../server/common/helpers/logging/logger.js'

vi.mock('../../server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn()
}))

describe('update task async', () => {
  afterEach(() => vi.resetAllMocks())
  afterAll(() => vi.restoreAllMocks())

  it('should update task and return payload', async () => {
    vi.spyOn(wreck, 'post').mockResolvedValue('ok')
    const mockWarn = vi.fn()
    createLogger.mockReturnValue({
      warn: mockWarn
    })
    const options = {
      caseId: '1234',
      groupId: '00-123456',
      taskId: 'Foo-vbar',
      isComplete: false
    }
    await updateTaskAsync(options)
    expect(mockWarn).not.toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    vi.spyOn(wreck, 'post').mockRejectedValue(new Error('oops'))
    const mockWarn = vi.fn()
    createLogger.mockReturnValue({
      warn: mockWarn
    })
    const options = {
      caseId: '1234',
      groupId: '00-123456',
      taskId: 'Foo-vbar',
      isComplete: false
    }
    await updateTaskAsync(options)
    expect(mockWarn).toHaveBeenCalledWith(
      'Was unable to update task with id Foo-vbar'
    )
  })
})
