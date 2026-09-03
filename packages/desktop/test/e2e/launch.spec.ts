import { expect, test } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import { launchElectron } from './helpers'

test.describe('Check Launch videodown', () => {
  let app: ElectronApplication
  let page: Page

  test.beforeAll(async () => {
    const { app: electronApp, page: firstPage } = await launchElectron()
    app = electronApp
    page = firstPage
  })

  test.afterAll(async () => {
    await app.close()
  })

  test('Empty videodown', async () => {
    await expect(page.locator('.projects-home')).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveTitle('Home')
  })
})
