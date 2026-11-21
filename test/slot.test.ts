import { describe, expect, test } from 'vitest'
import { InvalidSlot } from '../src/domain/errors.ts'
import { Slot } from '../src/domain/slot.ts'

const slot = (start: string, end: string) => new Slot(new Date(start), new Date(end))

describe('Slot', () => {
  test('accepts a one-hour slot at opening time', () => {
    expect(() => slot('2026-12-01T10:00:00Z', '2026-12-01T11:00:00Z')).not.toThrow()
  })

  test('accepts a four-hour slot that ends at closing time', () => {
    expect(() => slot('2026-12-01T19:00:00Z', '2026-12-01T23:00:00Z')).not.toThrow()
  })

  test('rejects a slot that does not start on a full hour', () => {
    expect(() => slot('2026-12-01T10:30:00Z', '2026-12-01T11:30:00Z')).toThrow(InvalidSlot)
  })

  test('rejects a slot longer than four hours', () => {
    expect(() => slot('2026-12-01T10:00:00Z', '2026-12-01T15:00:00Z')).toThrow(InvalidSlot)
  })

  test('rejects a slot that starts before opening', () => {
    expect(() => slot('2026-12-01T09:00:00Z', '2026-12-01T11:00:00Z')).toThrow(InvalidSlot)
  })

  test('adjacent slots do not overlap', () => {
    const first = slot('2026-12-01T10:00:00Z', '2026-12-01T12:00:00Z')
    expect(first.overlaps(slot('2026-12-01T12:00:00Z', '2026-12-01T13:00:00Z'))).toBe(false)
    expect(first.overlaps(slot('2026-12-01T11:00:00Z', '2026-12-01T13:00:00Z'))).toBe(true)
  })
})
