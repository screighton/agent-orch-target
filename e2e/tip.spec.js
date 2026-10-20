import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('shows zeros before a bill is entered', async ({ page }) => {
  await expect(page.getByTestId('tip-amount')).toHaveText('$0.00')
  await expect(page.getByTestId('total-amount')).toHaveText('$0.00')
  await expect(page.getByTestId('per-person')).toHaveText('$0.00')
})

test('calculates tip and total for a chosen percentage', async ({ page }) => {
  await page.getByTestId('bill-input').fill('100')
  await page.getByTestId('tip-20').click()
  await expect(page.getByTestId('tip-amount')).toHaveText('$20.00')
  await expect(page.getByTestId('total-amount')).toHaveText('$120.00')
})

test('splits the total evenly between people', async ({ page }) => {
  await page.getByTestId('bill-input').fill('100')
  await page.getByTestId('tip-20').click()
  for (let i = 0; i < 3; i++) await page.getByTestId('people-inc').click()
  await expect(page.getByTestId('people-count')).toHaveText('4')
  await expect(page.getByTestId('per-person')).toHaveText('$30.00')
})

test('rounds the per-person amount to the cent', async ({ page }) => {
  await page.getByTestId('bill-input').fill('50')
  await page.getByTestId('tip-15').click()
  await page.getByTestId('people-inc').click()
  await page.getByTestId('people-inc').click()
  await expect(page.getByTestId('total-amount')).toHaveText('$57.50')
  await expect(page.getByTestId('per-person')).toHaveText('$19.17')
})

test('switching the tip percentage updates the total', async ({ page }) => {
  await page.getByTestId('bill-input').fill('80')
  await page.getByTestId('tip-10').click()
  await expect(page.getByTestId('total-amount')).toHaveText('$88.00')
  await page.getByTestId('tip-20').click()
  await expect(page.getByTestId('total-amount')).toHaveText('$96.00')
})

test('people count never goes below one', async ({ page }) => {
  await page.getByTestId('people-dec').click()
  await expect(page.getByTestId('people-count')).toHaveText('1')
})

test('copy summary shows a confirmation toast', async ({ page }) => {
  await page.getByTestId('bill-input').fill('40')
  await page.getByTestId('copy-summary').click()
  await expect(page.getByTestId('toast')).toBeVisible()
})
