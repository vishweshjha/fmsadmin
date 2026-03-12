import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('API Integration', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('superadmin@fms.com', 'admin123')
  })

  test('should make API call to dashboard stats endpoint', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Intercept API call
    const apiCallPromise = page.waitForRequest(request => 
      request.url().includes('/admin/analytics/dashboard-stats')
    )
    
    await dashboardPage.goto()
    
    const request = await apiCallPromise
    expect(request.method()).toBe('GET')
    expect(request.headers()['authorization']).toContain('Bearer')
  })

  test('should make API call to bookings endpoint', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Intercept API call
    const apiCallPromise = page.waitForRequest(request => 
      request.url().includes('/admin/bookings')
    )
    
    await dashboardPage.goto()
    
    const request = await apiCallPromise
    expect(request.method()).toBe('GET')
    expect(request.headers()['authorization']).toContain('Bearer')
  })

  test('should include authentication token in API requests', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    let authHeader: string | undefined
    
    // Intercept all API requests
    page.on('request', request => {
      if (request.url().includes('/admin/')) {
        authHeader = request.headers()['authorization']
      }
    })
    
    await dashboardPage.goto()
    await page.waitForTimeout(2000) // Wait for API calls
    
    expect(authHeader).toBeDefined()
    expect(authHeader).toContain('Bearer')
  })

  test('should handle API error responses', async ({ page, context }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Mock API error
    await context.route('**/admin/analytics/dashboard-stats', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
          },
        }),
      })
    })
    
    await dashboardPage.goto()
    
    // Should show error message
    await expect(page.locator('text=Error loading dashboard')).toBeVisible({ timeout: 10000 })
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Block API calls
    await context.route('**/admin/**', route => {
      route.abort('failed')
    })
    
    await dashboardPage.goto()
    
    // Should show error or loading state
    const errorVisible = await page.locator('text=Error').isVisible().catch(() => false)
    const loadingVisible = await page.locator('text=Loading').isVisible().catch(() => false)
    
    expect(errorVisible || loadingVisible).toBe(true)
  })

  test('should retry failed API calls', async ({ page, context }) => {
    const dashboardPage = new DashboardPage(page)
    let requestCount = 0
    
    // First request fails, subsequent succeed
    await context.route('**/admin/analytics/dashboard-stats', route => {
      requestCount++
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Server error' } }),
        })
      } else {
        route.continue()
      }
    })
    
    await dashboardPage.goto()
    
    // Wait for error
    await expect(page.locator('text=Error loading dashboard')).toBeVisible({ timeout: 10000 })
    
    // Click retry
    await page.locator('button:has-text("Retry")').click()
    
    // Should make another request
    await page.waitForTimeout(2000)
    expect(requestCount).toBeGreaterThan(1)
  })

  test('should send correct query parameters', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    let requestUrl: string | undefined
    
    page.on('request', request => {
      if (request.url().includes('/admin/bookings')) {
        requestUrl = request.url()
      }
    })
    
    await dashboardPage.goto()
    await page.waitForTimeout(2000)
    
    if (requestUrl) {
      const url = new URL(requestUrl)
      // Check for common query parameters
      expect(url.searchParams.has('limit') || url.searchParams.has('page')).toBe(true)
    }
  })

  test('should handle empty API responses', async ({ page, context }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Mock empty response
    await context.route('**/admin/bookings**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),
      })
    })
    
    await dashboardPage.goto()
    await page.waitForTimeout(2000)
    
    // Should show empty state or handle gracefully
    const emptyState = await page.locator('text=No recent bookings').isVisible().catch(() => false)
    const tableVisible = await page.locator('table').isVisible().catch(() => false)
    
    expect(emptyState || tableVisible).toBe(true)
  })
})
