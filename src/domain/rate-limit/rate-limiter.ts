import type { RateLimitResult } from './rate-limit-result.ts'

export interface RateLimiter {
  consume(key: string, now?: number): RateLimitResult
}