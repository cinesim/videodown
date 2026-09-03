import { isSameProjectPath, removeProject, upsertProject, type ProjectEntry } from 'common/projects'
import type Preference from './preferences'

const readProjects = (preferences: Preference): ProjectEntry[] => {
  const stored = preferences.getItem<ProjectEntry[]>('projects')
  return Array.isArray(stored) ? stored : []
}

export const recordOpenedProject = (preferences: Preference, pathname: string): void => {
  preferences.setItems({
    lastOpenedFolder: pathname,
    projects: upsertProject(readProjects(preferences), pathname)
  })
}

export const forgetProject = (preferences: Preference, pathname: string): void => {
  const projects = readProjects(preferences)
  const next = removeProject(projects, pathname)
  const lastOpenedFolder = preferences.getItem<string>('lastOpenedFolder') || ''
  const updates: Record<string, unknown> = { projects: next }
  if (lastOpenedFolder && isSameProjectPath(lastOpenedFolder, pathname)) {
    updates.lastOpenedFolder = ''
  }
  preferences.setItems(updates)
}
