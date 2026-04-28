import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('superadmin@fms.com', 'admin123')
  })

  test('should navigate to User Management', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('User Management')
    
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible()
  })

  test('should navigate to KYC & Verification', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('KYC & Verification')
    
    await expect(page).toHaveURL('/kyc')
    await expect(page.locator('h1:has-text("KYC & Verification")')).toBeVisible()
  })

  test('should navigate to Booking Management', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('Booking Management')
    
    await expect(page).toHaveURL('/bookings')
    await expect(page.locator('h1:has-text("Booking Management")')).toBeVisible()
  })

  test('should navigate to Pricing & Commission', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('Pricing & Commission')
    
    await expect(page).toHaveURL('/pricing')
    await expect(page.locator('h1:has-text("Pricing & Commission")')).toBeVisible()
  })

  test('should navigate to Settlements & Finance', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('Settlements & Finance')
    
    await expect(page).toHaveURL('/settlements')
    await expect(page.locator('h1:has-text("Settlements & Finance")')).toBeVisible()
  })

  test('should navigate to Analytics & Reporting', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('Analytics & Reporting')
    
    await expect(page).toHaveURL('/analytics')
    await expect(page.locator('h1:has-text("Analytics & Reporting")')).toBeVisible()
  })

  test('should navigate to Audit & Logging', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToMenuItem('Audit & Logging')
    
    await expect(page).toHaveURL('/audit')
    await expect(page.locator('h1:has-text("Audit & Logging")')).toBeVisible()
  })

  test('should highlight active menu item', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Navigate to a menu item
    await dashboardPage.navigateToMenuItem('User Management')
    
    // Check that the menu item has active styling
    const activeMenuItem = page.locator('nav a[href="/users"]')
    await expect(activeMenuItem).toHaveClass(/bg-gray-800/)
  })

  test('should display user profile in sidebar', async ({ page }) => {
    await expect(page.locator('text=Super Admin')).toBeVisible()
    await expect(page.locator('text=superadmin@fms.com')).toBeVisible()
  })

  test('should have logout button in sidebar', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout")')
    await expect(logoutButton).toBeVisible()
  })

  test('should navigate back to dashboard from menu', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Navigate away
    await dashboardPage.navigateToMenuItem('User Management')
    
    // Navigate back to dashboard
    await dashboardPage.navigateToMenuItem('Dashboard')
    
    await expect(page).toHaveURL('/')
  })

  test('should navigate to Service Providers', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await dashboardPage.navigateToMenuItem('Service Providers')
    await expect(page).toHaveURL('/providers')
    await expect(page.locator('h1:has-text("Service Provider Management")')).toBeVisible()
  })

  test('should navigate to Service Catalog', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await dashboardPage.navigateToMenuItem('Service Catalog')
    await expect(page).toHaveURL('/services')
    await expect(page.locator('h1:has-text("Service Management")')).toBeVisible()
  })

  test('should navigate to Coupons', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await dashboardPage.navigateToMenuItem('Coupons')
    await expect(page).toHaveURL('/coupons')
    await expect(page.locator('h1:has-text("Coupon Management")')).toBeVisible()
  })

  test('should maintain sidebar visibility on navigation', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    // Navigate to different pages
    await dashboardPage.navigateToMenuItem('User Management')
    await expect(page.locator('nav')).toBeVisible()
    
    await dashboardPage.navigateToMenuItem('Booking Management')
    await expect(page.locator('nav')).toBeVisible()
    
    await dashboardPage.navigateToMenuItem('Dashboard')
    await expect(page.locator('nav')).toBeVisible()
  })
})
