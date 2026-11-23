import type { RateLimitResult } from '../rate-limit-result.ts'
import type { RateLimiter } from '../rate-limiter.ts'


type WindowCounter = {
  count: number
  resetAt: number
}

export class FixedWindow implements RateLimiter {
  private counters = new Map<string, WindowCounter>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer')
    }

    if (!Number.isInteger(windowMs) || windowMs < 1) {
      throw new Error('Window must be a positive integer')
    }
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    let counter = this.counters.get(key)

    if (!counter || now >= counter.resetAt) {
      counter = {
        count: 0,
        resetAt: now + this.windowMs,
      }
    }

    const allowed = counter.count < this.limit

    if (allowed) {
      counter.count++
    }

    this.counters.set(key, counter)

    return {
      allowed,
      limit: this.limit,
      remaining: Math.max(0, this.limit - counter.count),
      resetAt: counter.resetAt,
    }
  }
}
