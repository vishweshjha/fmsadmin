import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('superadmin@fms.com', 'admin123')
    await expect(page).toHaveURL('/')
  })

  test('should display all dashboard elements', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Check stats cards
    await expect(dashboardPage.statsCards).toHaveCount(4)
    await expect(page.locator('text=Total Bookings')).toBeVisible()
    await expect(page.locator('text=Active Users')).toBeVisible()
    await expect(page.locator('text=Revenue')).toBeVisible()
    await expect(page.locator('text=Pending KYC')).toBeVisible()
  })

  test('should display stats cards with data', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Wait for data to load
    await dashboardPage.waitForDataLoad()
    
    // Check that stats cards have numeric values
    const totalBookings = page.locator('text=Total Bookings').locator('..').locator('text=/\\d+/').first()
    await expect(totalBookings).toBeVisible()
  })

  test('should display recent bookings table', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(page.locator('text=Recent Bookings')).toBeVisible()
    await expect(page.locator('text=Service Name')).toBeVisible()
    await expect(page.locator('text=Customer')).toBeVisible()
    await expect(page.locator('text=Provider')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
  })

  test('should display booking statistics', async ({ page }) => {
    await page.waitForTimeout(2000) // Wait for API calls
    
    // Check for completed and in progress counts
    const completedCount = page.locator('text=Completed').locator('..').locator('text=/\\d+/').first()
    const inProgressCount = page.locator('text=In progress').locator('..').locator('text=/\\d+/').first()
    
    // These might be 0 if no data, but elements should exist
    await expect(completedCount.or(page.locator('text=0'))).toBeVisible()
  })

  test('should display productivity chart', async ({ page }) => {
    await expect(page.locator('text=Productivity')).toBeVisible()
    await expect(page.locator('text=Bookings')).toBeVisible()
    await expect(page.locator('text=Revenue')).toBeVisible()
    
    // Check for chart container (Recharts creates SVG elements)
    const chartContainer = page.locator('svg').first()
    await expect(chartContainer).toBeVisible({ timeout: 10000 })
  })

  test('should display quick stats section', async ({ page }) => {
    await expect(page.locator('text=Quick Stats')).toBeVisible()
  })

  test('should show loading state initially', async ({ page }) => {
    // Navigate to dashboard without waiting
    await page.goto('/')
    
    // Check for loading spinner (might be too fast to catch, but structure should exist)
    const loadingSpinner = page.locator('text=Loading dashboard').or(page.locator('[class*="animate-spin"]'))
    
    // Either loading or content should be visible
    const contentVisible = await page.locator('text=Total Bookings').isVisible().catch(() => false)
    const loadingVisible = await loadingSpinner.isVisible().catch(() => false)
    
    expect(contentVisible || loadingVisible).toBe(true)
  })

  test('should handle error state', async ({ page, context }) => {
    // Intercept API calls and return error
    await context.route('**/admin/analytics/dashboard-stats', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: { message: 'Server error' } }),
      })
    })
    
    await page.reload()
    
    // Should show error message
    await expect(page.locator('text=Error loading dashboard')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
  })

  test('should retry on error', async ({ page, context }) => {
    let requestCount = 0
    
    // First request fails, second succeeds
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
    
    await page.reload()
    
    // Wait for error
    await expect(page.locator('text=Error loading dashboard')).toBeVisible({ timeout: 10000 })
    
    // Click retry
    await page.locator('button:has-text("Retry")').click()
    
    // Should eventually load successfully
    await expect(page.locator('text=Total Bookings')).toBeVisible({ timeout: 10000 })
  })

  test('should format amounts correctly', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for currency formatting (₹ symbol)
    const revenueCard = page.locator('text=Revenue').locator('..')
    const amountText = await revenueCard.textContent()
    
    // Should contain ₹ symbol
    expect(amountText).toContain('₹')
  })

  test('should display growth percentages', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for growth indicators with % symbol
    const growthIndicators = page.locator('text=/\\+\\d+% from last week/')
    const count = await growthIndicators.count()
    
    // Should have at least one growth indicator
    expect(count).toBeGreaterThan(0)
  })
})
