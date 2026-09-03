import { describe, expect, it } from 'vitest'
import { relativeTime } from '@/util/relativeTime'

describe('relativeTime', () => {
  const now = Date.parse('2026-09-03T12:00:00.000Z')

  it('uses seconds below one minute', () => {
    expect(relativeTime(now - 1000, now)).toEqual({ n: 1, unit: 'second' })
    expect(relativeTime(now - 15_000, now)).toEqual({ n: 15, unit: 'second' })
  })

  it('uses minutes below one hour', () => {
    expect(relativeTime(now - 60_000, now)).toEqual({ n: 1, unit: 'minute' })
    expect(relativeTime(now - 5 * 60_000, now)).toEqual({ n: 5, unit: 'minutes' })
  })

  it('uses days below one month', () => {
    expect(relativeTime(now - 24 * 60 * 60_000, now)).toEqual({ n: 1, unit: 'day' })
    expect(relativeTime(now - 3 * 24 * 60 * 60_000, now)).toEqual({ n: 3, unit: 'days' })
  })
})
