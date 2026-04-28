import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Role-Based Access Control', () => {
  test('Super Admin should have access to all pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    await loginPage.login('superadmin@fms.com', 'admin123')
    
    // Check all menu items are visible
    const menuItems = [
      'Dashboard',
      'User Management',
      'Service Providers',
      'Service Catalog',
      'KYC & Verification',
      'Booking Management',
      'Pricing & Commission',
      'Settlements & Finance',
      'Analytics & Reporting',
      'Audit & Logging',
    ]
    
    for (const item of menuItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible()
    }
  })

  test('Operations Admin should only see allowed pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('operations@fms.com', 'admin123')
    
    // Should see
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=User Management')).toBeVisible()
    await expect(page.locator('text=Service Providers')).toBeVisible()
    await expect(page.locator('text=Service Catalog')).toBeVisible()
    await expect(page.locator('text=Booking Management')).toBeVisible()
    await expect(page.locator('text=Analytics & Reporting')).toBeVisible()
    
    // Should NOT see
    await expect(page.locator('text=KYC & Verification')).not.toBeVisible()
    await expect(page.locator('text=Pricing & Commission')).not.toBeVisible()
    await expect(page.locator('text=Settlements & Finance')).not.toBeVisible()
    await expect(page.locator('text=Audit & Logging')).not.toBeVisible()
  })

  test('Finance Admin should only see allowed pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('finance@fms.com', 'admin123')
    
    // Should see
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Pricing & Commission')).toBeVisible()
    await expect(page.locator('text=Settlements & Finance')).toBeVisible()
    await expect(page.locator('text=Analytics & Reporting')).toBeVisible()
    
    // Should NOT see
    await expect(page.locator('text=User Management')).not.toBeVisible()
    await expect(page.locator('text=KYC & Verification')).not.toBeVisible()
    await expect(page.locator('text=Booking Management')).not.toBeVisible()
    await expect(page.locator('text=Audit & Logging')).not.toBeVisible()
  })

  test('Support Agent should only see allowed pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('support@fms.com', 'admin123')
    
    // Should see
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Booking Management')).toBeVisible()
    
    // Should NOT see
    await expect(page.locator('text=User Management')).not.toBeVisible()
    await expect(page.locator('text=KYC & Verification')).not.toBeVisible()
    await expect(page.locator('text=Pricing & Commission')).not.toBeVisible()
    await expect(page.locator('text=Settlements & Finance')).not.toBeVisible()
    await expect(page.locator('text=Analytics & Reporting')).not.toBeVisible()
    await expect(page.locator('text=Audit & Logging')).not.toBeVisible()
  })

  test('Compliance Officer should only see allowed pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('compliance@fms.com', 'admin123')
    
    // Should see
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=KYC & Verification')).toBeVisible()
    await expect(page.locator('text=Audit & Logging')).toBeVisible()
    
    // Should NOT see
    await expect(page.locator('text=User Management')).not.toBeVisible()
    await expect(page.locator('text=Booking Management')).not.toBeVisible()
    await expect(page.locator('text=Pricing & Commission')).not.toBeVisible()
    await expect(page.locator('text=Settlements & Finance')).not.toBeVisible()
    await expect(page.locator('text=Analytics & Reporting')).not.toBeVisible()
  })

  test('should redirect to unauthorized page when accessing restricted route', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    // Login as Support Agent (limited access)
    await loginPage.login('support@fms.com', 'admin123')
    
    // Try to access restricted route directly
    await page.goto('/users')
    
    // Should redirect to unauthorized or dashboard
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/(unauthorized|$)/)
  })

  test('should display correct user role in sidebar', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('operations@fms.com', 'admin123')
    
    // Check user info in sidebar
    await expect(page.locator('text=Operations Admin')).toBeVisible()
    await expect(page.locator('text=operations@fms.com')).toBeVisible()
  })

  test('should prevent direct URL access to restricted pages', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    // Login as Support Agent
    await loginPage.login('support@fms.com', 'admin123')
    
    // Try to access finance page directly
    await page.goto('/settlements')
    
    // Should not be able to access
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/settlements')
  })
})
