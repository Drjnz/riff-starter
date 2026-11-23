
import type { RateLimitResult } from '../rate-limit-result.ts'
import type { RateLimiter } from '../rate-limiter.ts'
type Bucket = {
  tokens: number
  lastRefill: number
}

export class TokenBucket implements RateLimiter {
  private buckets = new Map<string, Bucket>()

  constructor(
    private readonly capacity: number,
    private readonly refillRate: number,
    private readonly refillIntervalMs: number,
  ) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('Capacity must be a positive integer')
    }

    if (!Number.isFinite(refillRate) || refillRate <= 0) {
      throw new Error('Refill rate must be positive')
    }

    if (!Number.isInteger(refillIntervalMs) || refillIntervalMs < 1) {
      throw new Error('Refill interval must be a positive integer')
    }
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    const bucket = this.buckets.get(key) ?? {
      tokens: this.capacity,
      lastRefill: now,
    }

    // Calculer les jetons rechargés depuis la dernière vérification.
    const elapsed = Math.max(0, now - bucket.lastRefill)
    const refilledTokens = (elapsed / this.refillIntervalMs) * this.refillRate

    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + refilledTokens,
    )

    bucket.lastRefill = now

    const allowed = bucket.tokens >= 1

    if (allowed) {
      bucket.tokens -= 1
    }

    this.buckets.set(key, bucket)

    const timeUntilNextToken = bucket.tokens >= 1
      ? 0
      : Math.ceil(
          ((1 - bucket.tokens) / this.refillRate) * this.refillIntervalMs,
        )

    return {
      allowed,
      limit: this.capacity,
      remaining: Math.floor(bucket.tokens),
      resetAt: now + timeUntilNextToken,
    }
  }
}
