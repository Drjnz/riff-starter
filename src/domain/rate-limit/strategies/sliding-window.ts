
import type { RateLimitResult } from '../rate-limit-result.ts'
import type { RateLimiter } from '../rate-limiter.ts'

export class SlidingWindow implements RateLimiter {
  private requests = new Map<string, number[]>()

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
    const timestamps = this.requests.get(key) ?? []

    // Garder uniquement les requêtes dans la fenêtre actuelle.
    const activeRequests = timestamps.filter(
      (timestamp) => timestamp > now - this.windowMs,
    )

    const allowed = activeRequests.length < this.limit

    if (allowed) {
      activeRequests.push(now)
    }

    this.requests.set(key, activeRequests)

    const oldestRequest = activeRequests[0]
    const resetAt = oldestRequest === undefined
      ? now + this.windowMs
      : oldestRequest + this.windowMs

    return {
      allowed,
      limit: this.limit,
      remaining: Math.max(0, this.limit - activeRequests.length),
      resetAt,
    }
  }
}
