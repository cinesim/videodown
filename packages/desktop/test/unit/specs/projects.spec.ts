import { describe, expect, it } from 'vitest'
import { pruneProjects, removeProject, upsertProject } from 'common/projects'

describe('project list helpers', () => {
  it('inserts a new project at the front', () => {
    const next = upsertProject([{ pathname: '/old', lastOpenedAt: 1 }], '/new', 10)
    expect(next).toEqual([
      { pathname: '/new', lastOpenedAt: 10 },
      { pathname: '/old', lastOpenedAt: 1 }
    ])
  })

  it('moves an existing project to the front and updates lastOpenedAt', () => {
    const next = upsertProject(
      [
        { pathname: '/a', lastOpenedAt: 1 },
        { pathname: '/b', lastOpenedAt: 2 }
      ],
      '/b',
      9
    )
    expect(next).toEqual([
      { pathname: '/b', lastOpenedAt: 9 },
      { pathname: '/a', lastOpenedAt: 1 }
    ])
  })

  it('removes a project by path', () => {
    const next = removeProject(
      [
        { pathname: '/a', lastOpenedAt: 1 },
        { pathname: '/b', lastOpenedAt: 2 }
      ],
      '/a'
    )
    expect(next).toEqual([{ pathname: '/b', lastOpenedAt: 2 }])
  })

  it('prunes to an allow-list of pathnames', () => {
    const next = pruneProjects(
      [
        { pathname: '/keep', lastOpenedAt: 1 },
        { pathname: '/drop', lastOpenedAt: 2 }
      ],
      ['/keep']
    )
    expect(next).toEqual([{ pathname: '/keep', lastOpenedAt: 1 }])
  })
})
