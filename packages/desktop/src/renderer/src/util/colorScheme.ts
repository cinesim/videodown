import { isDarkThemeId } from 'common/theme'

export interface ColorSchemePreferences {
  theme: string
  followSystemTheme: boolean
  lightModeTheme: string
  darkModeTheme: string
}

export const isDarkColorScheme = (theme: string): boolean => {
  return isDarkThemeId(theme)
}

export const getOppositeColorSchemeTheme = ({
  theme,
  lightModeTheme,
  darkModeTheme
}: Pick<ColorSchemePreferences, 'theme' | 'lightModeTheme' | 'darkModeTheme'>): string => {
  return isDarkColorScheme(theme) ? lightModeTheme : darkModeTheme
}

export const getColorSchemeToggleUpdates = (
  preferences: ColorSchemePreferences
): Pick<ColorSchemePreferences, 'theme' | 'followSystemTheme'> => {
  return {
    theme: getOppositeColorSchemeTheme(preferences),
    followSystemTheme: false
  }
}
