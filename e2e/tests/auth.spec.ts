import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.signInButton).toBeVisible()
    await expect(loginPage.signUpLink).toBeVisible()
    await expect(page.locator('text=FMS ADMIN')).toBeVisible()
  })

  test('should show validation error for empty form submission', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.signInButton.click()
    
    // HTML5 validation should prevent submission
    const emailInput = loginPage.emailInput
    const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing)
    expect(isRequired).toBe(true)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.login('invalid@fms.com', 'wrongpassword')
    
    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 })
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    await loginPage.login('superadmin@fms.com', 'admin123')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
    await expect(dashboardPage.statsCards.first()).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.emailInput.fill('test@fms.com')
    await loginPage.passwordInput.fill('password123')
    
    // Password should be hidden by default
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await toggleButton.click()
    
    // Password should be visible
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text')
  })

  test('should navigate to signup page', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    await loginPage.signUpLink.click()
    
    await expect(page).toHaveURL('/signup')
    await expect(page.locator('text=Create Account')).toBeVisible()
  })

  test('should remember me checkbox work', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    const rememberMeCheckbox = page.locator('input[type="checkbox"]').first()
    await rememberMeCheckbox.check()
    
    await expect(rememberMeCheckbox).toBeChecked()
  })

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    
    // Login first
    await loginPage.login('superadmin@fms.com', 'admin123')
    await expect(page).toHaveURL('/')
    
    // Logout
    await dashboardPage.logout()
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect authenticated user from login page', async ({ page }) => {
    const loginPage = new LoginPage(page)
    
    // Login first
    await loginPage.login('superadmin@fms.com', 'admin123')
    
    // Try to access login page again
    await page.goto('/login')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
  })
})
