import type { RateLimiter } from './rate-limiter.ts'
import { FixedWindow } from './strategies/correction-window.ts'
import { SlidingWindow } from './strategies/sliding-window.ts'
import { TokenBucket } from './strategies/token.ts'

export type RateLimitConfig =
  | {
      strategy: 'fixed-window'
      limit: number
      windowMs: number
    }
  | {
      strategy: 'sliding-window'
      limit: number
      windowMs: number
    }
  | {
      strategy: 'token-bucket'
      capacity: number
      refillRate: number
      refillIntervalMs: number
    }

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  switch (config.strategy) {
    case 'fixed-window':
      return new FixedWindow(config.limit, config.windowMs)

    case 'sliding-window':
      return new SlidingWindow(config.limit, config.windowMs)

    case 'token-bucket':
      return new TokenBucket(
        config.capacity,
        config.refillRate,
        config.refillIntervalMs,
      )
  }
}