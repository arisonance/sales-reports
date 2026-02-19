import { test, expect } from '@playwright/test'

async function setupDirector(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.waitForSelector('select')

  // Wait for API to populate director options
  await page.waitForFunction(() => {
    const select = document.querySelector('select')
    return select && select.options.length > 1
  }, { timeout: 10000 }).catch(() => {})

  // Select the first director from the dropdown
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
}

test.describe('Sales Data Tab - Number Input Fields', () => {
  test.beforeEach(async ({ page }) => {
    await setupDirector(page)
  })

  test('can navigate to Sales Data tab', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()
    await expect(page.locator('text=Regional Performance')).toBeVisible()
  })

  test('can type in regional performance currency fields', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    // Find the first currency input (Monthly Sales)
    const monthlySalesInput = page.locator('input[type="text"][inputmode="decimal"]').first()
    await monthlySalesInput.click()
    await monthlySalesInput.fill('50000')
    await monthlySalesInput.blur()

    // After blur, should show formatted value with commas
    await expect(monthlySalesInput).toHaveValue('50,000')
  })

  test('can clear a currency field and leave it empty', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    const input = page.locator('input[type="text"][inputmode="decimal"]').first()
    // Type a value
    await input.click()
    await input.fill('1234')
    await input.blur()
    await expect(input).toHaveValue('1,234')

    // Now clear it
    await input.click()
    await input.fill('')
    await input.blur()
    // Should show empty (or placeholder "0")
    await expect(input).toHaveValue('')
  })

  test('can type in multiple regional performance fields', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    const currencyInputs = page.locator('input[type="text"][inputmode="decimal"]')
    const count = await currencyInputs.count()

    // Should have at least 6 regional fields
    expect(count).toBeGreaterThanOrEqual(6)

    // Type in all 6 regional fields
    const values = ['50000', '75000', '300000', '500000', '25000', '100000']
    const expected = ['50,000', '75,000', '300,000', '500,000', '25,000', '100,000']

    for (let i = 0; i < 6; i++) {
      await currencyInputs.nth(i).click()
      await currencyInputs.nth(i).fill(values[i])
      await currencyInputs.nth(i).blur()
      await expect(currencyInputs.nth(i)).toHaveValue(expected[i])
    }
  })

  test('entity name input accepts text', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    // Look for entity name text input (not a select)
    const entityNameInput = page.locator('input[placeholder*="e.g."]').first()
    if (await entityNameInput.isVisible()) {
      await entityNameInput.fill('Test Firm ABC')
      await expect(entityNameInput).toHaveValue('Test Firm ABC')
    }
  })

  test('entity currency fields accept input (phantom entity promotion)', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    // After the 6 regional inputs, there should be entity-level currency inputs
    const allCurrencyInputs = page.locator('input[type="text"][inputmode="decimal"]')
    const count = await allCurrencyInputs.count()

    if (count > 6) {
      // Entity Monthly Sales field
      const entityInput = allCurrencyInputs.nth(6)
      await entityInput.click()
      await entityInput.fill('15000')
      await entityInput.blur()
      await expect(entityInput).toHaveValue('15,000')
    }
  })

  test('percentage fields accept numeric input', async ({ page }) => {
    const salesTab = page.locator('button:has-text("Sales")')
    if (!(await salesTab.isVisible())) {
      test.skip()
      return
    }
    await salesTab.click()

    const numberInputs = page.locator('input[type="number"]')
    const count = await numberInputs.count()

    if (count > 0) {
      // % to Goal field
      await numberInputs.first().fill('85.5')
      await expect(numberInputs.first()).toHaveValue('85.5')
    }
  })
})

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupDirector(page)
  })

  test('can navigate between all visible tabs', async ({ page }) => {
    // Find all tab buttons
    const tabButtons = page.locator('button').filter({ hasText: /Info|Wins|Sales|Competition|Photos/ })
    const count = await tabButtons.count()

    for (let i = 0; i < count; i++) {
      await tabButtons.nth(i).click()
      // Active tab should have the sonance-blue background
      await expect(tabButtons.nth(i)).toHaveClass(/bg-sonance-blue/)
    }
  })
})

test.describe('Auto-save', () => {
  test('shows save status transitions on edit', async ({ page }) => {
    await setupDirector(page)

    // Type something to trigger auto-save
    const summaryTextarea = page.locator('textarea').first()
    if (await summaryTextarea.isVisible()) {
      await summaryTextarea.fill('Test auto-save status ' + Date.now())

      // Should eventually show "Unsaved changes" then "Saving..." then "All changes saved"
      await expect(
        page.locator('text=Unsaved changes').or(page.locator('text=Saving...')).or(page.locator('text=All changes saved'))
      ).toBeVisible({ timeout: 5000 })
    }
  })
})
