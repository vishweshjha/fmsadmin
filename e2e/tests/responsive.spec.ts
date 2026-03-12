import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('superadmin@fms.com', 'admin123')
  })

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    
    // Sidebar should be visible or collapsible
    const sidebar = page.locator('nav')
    await expect(sidebar).toBeVisible()
    
    // Stats cards should stack vertically
    const statsCards = page.locator('[class*="grid"]').first()
    const gridClass = await statsCards.getAttribute('class')
    expect(gridClass).toContain('grid-cols-1')
  })

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    
    // Check layout adapts
    const statsCards = page.locator('[class*="grid"]').first()
    const gridClass = await statsCards.getAttribute('class')
    expect(gridClass).toContain('md:grid-cols-2')
  })

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop
    
    // Should use full grid layout
    const statsCards = page.locator('[class*="grid"]').first()
    const gridClass = await statsCards.getAttribute('class')
    expect(gridClass).toContain('lg:grid-cols-4')
  })

  test('should handle table overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    const table = page.locator('table')
    const tableContainer = table.locator('..')
    const containerClass = await tableContainer.getAttribute('class')
    
    // Should have overflow handling
    expect(containerClass).toContain('overflow')
  })

  test('should maintain sidebar functionality on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Sidebar should still be functional
    const menuItems = page.locator('nav a')
    const count = await menuItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should adapt chart size on different viewports', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    const chartDesktop = page.locator('svg').first()
    const desktopBounds = await chartDesktop.boundingBox()
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500) // Wait for resize
    const chartMobile = page.locator('svg').first()
    const mobileBounds = await chartMobile.boundingBox()
    
    // Chart should resize (mobile should be narrower)
    if (desktopBounds && mobileBounds) {
      expect(mobileBounds.width).toBeLessThan(desktopBounds.width)
    }
  })
})
