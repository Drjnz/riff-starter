
import { describe, expect, test } from 'vitest'
import { SlidingWindow } from '../src/domain/rate-limit/strategies/sliding-window.ts'

describe('SlidingWindow', () => {
  test('blocks requests after reaching the limit', () => {
    const limiter = new SlidingWindow(2, 60_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-1', 2000).allowed).toBe(true)
    expect(limiter.consume('client-1', 3000).allowed).toBe(false)
  })

  test('removes expired requests from the window', () => {
    const limiter = new SlidingWindow(2, 60_000)

    limiter.consume('client-1', 1000)
    limiter.consume('client-1', 2000)

    // La première requête a expiré.
    expect(limiter.consume('client-1', 61_001).allowed).toBe(true)
  })

  test('keeps counters separate for each client', () => {
    const limiter = new SlidingWindow(1, 60_000)

    expect(limiter.consume('client-1', 1000).allowed).toBe(true)
    expect(limiter.consume('client-2', 1000).allowed).toBe(true)
  })
})
