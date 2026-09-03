import path from 'path'

export interface ProjectEntry {
  pathname: string
  lastOpenedAt: number
}

export const normalizeProjectPath = (pathname: string): string => path.normalize(pathname)

export const isSameProjectPath = (left: string, right: string): boolean => {
  const a = normalizeProjectPath(left)
  const b = normalizeProjectPath(right)
  if (process.platform === 'win32') {
    return a.toLowerCase() === b.toLowerCase()
  }
  return a === b
}

export const upsertProject = (
  projects: ProjectEntry[],
  pathname: string,
  now = Date.now()
): ProjectEntry[] => {
  const normalized = normalizeProjectPath(pathname)
  const rest = projects.filter((entry) => !isSameProjectPath(entry.pathname, normalized))
  return [{ pathname: normalized, lastOpenedAt: now }, ...rest]
}

export const removeProject = (projects: ProjectEntry[], pathname: string): ProjectEntry[] => {
  return projects.filter((entry) => !isSameProjectPath(entry.pathname, pathname))
}

export const pruneProjects = (
  projects: ProjectEntry[],
  keepPathnames: string[]
): ProjectEntry[] => {
  return projects.filter((entry) =>
    keepPathnames.some((pathname) => isSameProjectPath(entry.pathname, pathname))
  )
}
