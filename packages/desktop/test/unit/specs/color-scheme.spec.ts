import { describe, it, expect } from 'vitest'
import {
  getColorSchemeToggleUpdates,
  getOppositeColorSchemeTheme,
  isDarkColorScheme
} from '@/util/colorScheme'

describe('colorScheme', () => {
  it('classifies built-in dark and light themes', () => {
    expect(isDarkColorScheme('dark')).toBe(true)
    expect(isDarkColorScheme('dracula')).toBe(true)
    expect(isDarkColorScheme('light')).toBe(false)
    expect(isDarkColorScheme('graphite')).toBe(false)
  })

  it('returns the configured opposite theme', () => {
    expect(
      getOppositeColorSchemeTheme({
        theme: 'dark',
        lightModeTheme: 'ulysses',
        darkModeTheme: 'nord'
      })
    ).toBe('ulysses')

    expect(
      getOppositeColorSchemeTheme({
        theme: 'light',
        lightModeTheme: 'ulysses',
        darkModeTheme: 'nord'
      })
    ).toBe('nord')
  })

  it('disables followSystemTheme when toggling', () => {
    expect(
      getColorSchemeToggleUpdates({
        theme: 'dracula',
        followSystemTheme: true,
        lightModeTheme: 'light',
        darkModeTheme: 'dark'
      })
    ).toEqual({
      theme: 'light',
      followSystemTheme: false
    })

    expect(
      getColorSchemeToggleUpdates({
        theme: 'graphite',
        followSystemTheme: false,
        lightModeTheme: 'graphite',
        darkModeTheme: 'one-dark'
      })
    ).toEqual({
      theme: 'one-dark',
      followSystemTheme: false
    })
  })
})
