
import { describe, expect, test } from 'vitest'
import { TokenBucket } from '../src/domain/rate-limit/strategies/token.ts'

describe('TokenBucket', () => {
  test('allows requests while tokens are available', () => {
    const limiter = new TokenBucket(2, 1, 10_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-1', 1000).allowed).toBe(false)
  })

  test('refills tokens over time', () => {
    const limiter = new TokenBucket(2, 1, 10_000)

    limiter.consume('client-1', 1000)
    limiter.consume('client-1', 1000)

    // 10 secondes plus tard, un jeton est disponible.
    expect(limiter.consume('client-1', 11_000).allowed).toBe(true)
  })

  test('does not exceed bucket capacity', () => {
    const limiter = new TokenBucket(2, 1, 10_000)

    limiter.consume('client-1', 1000)

    // Beaucoup de temps passe, mais le seau reste limité à 2 jetons.
    expect(limiter.consume('client-1', 100_000).remaining).toBe(1)
  })

  test('keeps buckets separate for each client', () => {
    const limiter = new TokenBucket(1, 1, 10_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-2', 1000).allowed).toBe(true)
  })
})
