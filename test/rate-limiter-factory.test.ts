import { describe, expect, test } from 'vitest'
import { createRateLimiter } from '../src/domain/rate-limit/rate-limiter-factory.ts'
import { FixedWindow } from '../src/domain/rate-limit/strategies/correction-window.ts'
import { SlidingWindow } from '../src/domain/rate-limit/strategies/sliding-window.ts'
import { TokenBucket } from '../src/domain/rate-limit/strategies/token.ts'

describe('RateLimiterFactory', () => {
  test('creates a FixedWindow strategy', () => {
    const limiter = createRateLimiter({
      strategy: 'fixed-window',
      limit: 10,
      windowMs: 60_000,
    })

    expect(limiter).toBeInstanceOf(FixedWindow)
  })

  test('creates a SlidingWindow strategy', () => {
    const limiter = createRateLimiter({
      strategy: 'sliding-window',
      limit: 10,
      windowMs: 60_000,
    })

    expect(limiter).toBeInstanceOf(SlidingWindow)
  })

  test('creates a TokenBucket strategy', () => {
    const limiter = createRateLimiter({
      strategy: 'token-bucket',
      capacity: 10,
      refillRate: 1,
      refillIntervalMs: 1_000,
    })

    expect(limiter).toBeInstanceOf(TokenBucket)
  })
})