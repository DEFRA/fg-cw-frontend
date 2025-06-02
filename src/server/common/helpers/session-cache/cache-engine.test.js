import { describe, test, beforeEach, vi, expect } from 'vitest'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { getCacheEngine } from './cache-engine.js'
import { config } from '../../../../config/config.js'

vi.mock('@hapi/catbox-redis')
vi.mock('@hapi/catbox-memory')

describe('getCacheEngine', () => {
  describe('Using Redis Cache Engine', () => {
    beforeEach(() => {
      config.set('redis', {})
      getCacheEngine('redis')
    })

    test('should initialize Redis cache engine', () => {
      expect(CatboxRedis).toHaveBeenCalledTimes(1)
      expect(CatboxRedis).toHaveBeenCalledWith(
        expect.objectContaining({ client: expect.any(Object) })
      )
    })
  })

  describe('Using Memory Cache Engine', () => {
    beforeEach(() => {
      config.set('isProduction', false)
      getCacheEngine()
    })

    test('should initialize In-memory cache engine', () => {
      expect(CatboxMemory).toHaveBeenCalledTimes(1)
    })
  })

  describe('Using Memory Cache Engine in Production', () => {
    beforeEach(() => {
      config.set('isProduction', true)
      getCacheEngine()
    })

    test('should still initialize In-memory cache engine', () => {
      expect(CatboxMemory).toHaveBeenCalledTimes(1)
    })
  })
})
