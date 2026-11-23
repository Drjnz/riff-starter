
import { describe, expect, test } from 'vitest'
import { FixedWindow } from '../src/domain/rate-limit/strategies/correction-window.ts'

describe('FixedWindow', () => {
  test('allows requests until the limit is reached', () => {
    const limiter = new FixedWindow(2, 60_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-1', 2000).allowed).toBe(true)
    expect(limiter.consume('client-1', 3000).allowed).toBe(false)
  })

  test('resets the counter after the window expires', () => {
    const limiter = new FixedWindow(2, 60_000)

    limiter.consume('client-1', 1000)
    limiter.consume('client-1', 2000)

    expect(limiter.consume('client-1', 61_000).allowed).toBe(true)
  })

  test('keeps counters separate for each client', () => {
    const limiter = new FixedWindow(1, 60_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-2', 1000).allowed).toBe(true)
  })
})
