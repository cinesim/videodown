export type RelativeUnitKey =
  | 'second'
  | 'minute'
  | 'minutes'
  | 'hour'
  | 'hours'
  | 'day'
  | 'days'
  | 'month'
  | 'months'
  | 'year'
  | 'years'

export interface RelativeTime {
  n: number
  unit: RelativeUnitKey
}

export const relativeTime = (mtimeMs: number, now = Date.now()): RelativeTime => {
  const elapsed = Math.max(0, now - mtimeMs)
  const seconds = Math.floor(elapsed / 1000)
  if (seconds < 60) return { n: Math.max(1, seconds), unit: 'second' }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return { n: minutes, unit: minutes === 1 ? 'minute' : 'minutes' }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return { n: hours, unit: hours === 1 ? 'hour' : 'hours' }

  const days = Math.floor(hours / 24)
  if (days < 30) return { n: days, unit: days === 1 ? 'day' : 'days' }

  const months = Math.floor(days / 30)
  if (months < 12) return { n: months, unit: months === 1 ? 'month' : 'months' }

  const years = Math.max(1, Math.floor(days / 365))
  return { n: years, unit: years === 1 ? 'year' : 'years' }
}
