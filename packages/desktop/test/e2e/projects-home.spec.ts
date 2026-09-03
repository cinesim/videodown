import { expect, test } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { launchElectron } from './helpers'

const stubSaveDialog = async (app: ElectronApplication, filePath: string): Promise<void> => {
  await app.evaluate(async ({ dialog }, targetPath) => {
    const g = global as unknown as {
      __mt_orig_showSaveDialog__?: typeof dialog.showSaveDialog
    }
    if (!g.__mt_orig_showSaveDialog__) {
      g.__mt_orig_showSaveDialog__ = dialog.showSaveDialog.bind(dialog)
    }
    ;(dialog as unknown as { showSaveDialog: unknown }).showSaveDialog = async () => ({
      canceled: false,
      filePath: targetPath
    })
  }, filePath)
}

test.describe('Projects home page', () => {
  let app: ElectronApplication
  let page: Page
  let createdProject: string | null = null

  test.beforeAll(async () => {
    const launched = await launchElectron()
    app = launched.app
    page = launched.page
    await page.waitForSelector('.side-bar', { timeout: 15000 })
  })

  test.afterAll(async () => {
    if (app) await app.close().catch(() => {})
    if (createdProject) {
      try {
        fs.rmSync(createdProject, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
  })

  test('Empty launch shows the projects home page', async () => {
    await expect(page.locator('.projects-home')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.projects-title')).toHaveText('Projects')
    await expect(page.locator('.new-project-button')).toContainText('New')
    await expect(page.locator('.projects-empty')).toHaveText('No projects to show')
    await expect(page).toHaveTitle('Home')
  })

  test('Home sidebar button keeps the projects page open', async () => {
    await page.locator('.side-bar li[data-id="home"]').click()
    await expect(page.locator('.projects-home')).toBeVisible()
    await expect(page.locator('.projects-title')).toHaveText('Projects')
  })

  test('Empty state appears when no projects remain', async () => {
    await page.locator('.side-bar li[data-id="home"]').click()
    await page.waitForSelector('.projects-home', { timeout: 5000 })
    const pathnames = await page
      .locator('.project-card')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-pathname') || ''))
    for (const pathname of pathnames) {
      if (!pathname) continue
      await page.evaluate((projectPath) => {
        window.electron.ipcRenderer.send('mt::forget-project', projectPath)
      }, pathname)
    }
    await expect(page.locator('.projects-empty')).toHaveText('No projects to show')
  })

  test('New creates a project folder and opens it', async () => {
    createdProject = path.join(
      os.tmpdir(),
      'videodown-project-' + Math.random().toString(36).slice(2, 8)
    )
    await stubSaveDialog(app, createdProject)
    await page.locator('.side-bar li[data-id="home"]').click()
    await page.waitForSelector('.new-project-button', { timeout: 5000 })
    await page.locator('.new-project-button').click()
    await page.waitForFunction(() => !document.querySelector('.projects-home'), null, {
      timeout: 10000
    })
    expect(fs.existsSync(createdProject)).toBe(true)
    await page.locator('.side-bar li[data-id="home"]').click()
    await page.waitForSelector('.project-card', { timeout: 5000 })
    await expect(page.locator('.project-card-name').first()).toContainText(
      path.basename(createdProject)
    )
  })

  test('Delete confirms with a dialog and removes the card', async () => {
    const projectPath = createdProject
    if (!projectPath) {
      test.skip()
      return
    }
    await page.locator('.side-bar li[data-id="home"]').click()
    const card = page.locator('.project-card', { hasText: path.basename(projectPath) })
    await expect(card).toBeVisible()
    await card.hover()
    await card.locator('.project-card-delete').click()
    await expect(page.locator('.el-dialog')).toBeVisible()
    await page.locator('.el-dialog .el-button--danger').click()
    await expect(card).toHaveCount(0, { timeout: 5000 })
  })
})
