import type { Clock } from '../domain/ports.ts'

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}

// Frozen clock for tests and demos.
export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}

  now(): Date {
    return new Date(this.instant)
  }
}
