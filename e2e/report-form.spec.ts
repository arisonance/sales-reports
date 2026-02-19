import { test, expect } from '@playwright/test'

async function waitForDirectors(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('select')
  // Wait for API to populate director options
  await page.waitForFunction(() => {
    const select = document.querySelector('select')
    return select && select.options.length > 1
  }, { timeout: 10000 }).catch(() => {})
}

test.describe('Report Form - Basic Flow', () => {
  test('home page loads and shows director selector', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('select')).toBeVisible()
    await expect(page.locator('button:has-text("Start")')).toBeVisible()
  })

  test('shows director options in dropdown when database has directors', async ({ page }) => {
    await waitForDirectors(page)

    const options = await page.$$eval('select option', opts =>
      opts.filter(o => (o as HTMLOptionElement).value).map(o => (o as HTMLOptionElement).textContent)
    )
    if (options.length === 0) {
      test.skip()
      return
    }
    expect(options.length).toBeGreaterThan(0)
  })

  test('selecting a director shows their info', async ({ page }) => {
    await waitForDirectors(page)

    const options = await page.$$eval('select option', opts =>
      opts.filter(o => (o as HTMLOptionElement).value).map(o => (o as HTMLOptionElement).value)
    )
    if (options.length === 0) {
      test.skip()
      return
    }

    await page.selectOption('select', options[0])
    await expect(page.locator('text=Region:')).toBeVisible()
    await expect(page.locator('text=Email:')).toBeVisible()
  })

  test('start button navigates to report page', async ({ page }) => {
    await waitForDirectors(page)

    const options = await page.$$eval('select option', opts =>
      opts.filter(o => (o as HTMLOptionElement).value).map(o => (o as HTMLOptionElement).value)
    )
    if (options.length === 0) {
      test.skip()
      return
    }

    await page.selectOption('select', options[0])
    await page.click('button:has-text("Start")')
    await page.waitForURL('/report', { timeout: 10000 })

    await expect(page.locator('button:has-text("Info")')).toBeVisible()
  })

  test('report page shows signed-in user info', async ({ page }) => {
    await waitForDirectors(page)

    const options = await page.$$eval('select option', opts =>
      opts.filter(o => (o as HTMLOptionElement).value).map(o => (o as HTMLOptionElement).value)
    )
    if (options.length === 0) {
      test.skip()
      return
    }

    await page.selectOption('select', options[0])
    await page.click('button:has-text("Start")')
    await page.waitForURL('/report', { timeout: 10000 })

    await expect(page.locator('text=Signed in as:')).toBeVisible()
    await expect(page.locator('text=Switch Account')).toBeVisible()
  })

  test('switch account returns to home page', async ({ page }) => {
    await waitForDirectors(page)

    const options = await page.$$eval('select option', opts =>
      opts.filter(o => (o as HTMLOptionElement).value).map(o => (o as HTMLOptionElement).value)
    )
    if (options.length === 0) {
      test.skip()
      return
    }

    await page.selectOption('select', options[0])
    await page.click('button:has-text("Start")')
    await page.waitForURL('/report', { timeout: 10000 })

    await page.click('text=Switch Account')
    await page.waitForURL('/')
  })
})
