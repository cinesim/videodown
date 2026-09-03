import { expect, test } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import { launchWithMarkdown } from './helpers'

test.describe('Color scheme toggle', () => {
  let app: ElectronApplication
  let page: Page

  test.beforeAll(async () => {
    const launched = await launchWithMarkdown('# Toggle test\n\nHello world.\n')
    app = launched.app
    page = launched.page
  })

  test.afterAll(async () => {
    if (app) await app.close()
  })

  test('title bar toggle switches between light and dark themes', async () => {
    const toggle = page.locator('.color-scheme-toggle')
    await expect(toggle).toBeVisible()

    await expect(page.locator('body')).not.toHaveClass(/(^|\s)dark(\s|$)/)

    await toggle.click()
    await expect(page.locator('body')).toHaveClass(/(^|\s)dark(\s|$)/, { timeout: 5000 })

    await toggle.click()
    await page.waitForFunction(() => !document.body.classList.contains('dark'), null, {
      timeout: 5000
    })
    expect(await page.evaluate(() => document.body.classList.contains('dark'))).toBe(false)
  })
})
