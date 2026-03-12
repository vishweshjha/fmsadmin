/**
 * Test Helper Utilities
 */

import { Page } from '@playwright/test'

/**
 * Wait for API calls to complete
 */
export async function waitForApiCalls(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any,
  status = 200
) {
  await page.route(urlPattern, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

/**
 * Get authentication token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('fms_admin_token')
  })
}

/**
 * Set authentication token in localStorage
 */
export async function setAuthToken(page: Page, token: string) {
  await page.evaluate((token) => {
    localStorage.setItem('fms_admin_token', token)
  }, token)
}

/**
 * Clear all localStorage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

/**
 * Wait for element to be visible with retry
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  maxRetries = 3,
  delay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: delay })
      return true
    } catch {
      if (i < maxRetries - 1) {
        await page.waitForTimeout(delay)
      }
    }
  }
  return false
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png` })
}

/**
 * Format date for API requests
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get date range for last N days
 */
export function getDateRange(days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  return {
    dateFrom: formatDateForAPI(startDate),
    dateTo: formatDateForAPI(endDate),
  }
}

/**
 * Wait for API request to complete
 */
export async function waitForApiRequest(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForRequest(
    request => {
      const url = request.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern)
      }
      return urlPattern.test(url)
    },
    { timeout }
  )
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForResponse(
    response => {
      const url = response.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern) && response.ok()
      }
      return urlPattern.test(url) && response.ok()
    },
    { timeout }
  )
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 })
    return true
  } catch {
    return false
  }
}

/**
 * Get text content safely
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string | null> {
  try {
    return await page.locator(selector).textContent()
  } catch {
    return null
  }
}
