import { test, expect } from '@playwright/test'

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('should display signup page correctly', async ({ page }) => {
    await expect(page.locator('text=Create Account')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible() // Name field
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(2) // Password and confirm
    await expect(page.locator('select')).toBeVisible() // Role select
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible()
  })

  test('should show validation for empty fields', async ({ page }) => {
    const signUpButton = page.locator('button:has-text("Sign Up")')
    await signUpButton.click()
    
    // HTML5 validation should prevent submission
    const nameInput = page.locator('input[type="text"]')
    const isRequired = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing)
    expect(isRequired).toBe(true)
  })

  test('should show error for password mismatch', async ({ page }) => {
    await page.locator('input[type="text"]').fill('Test User')
    await page.locator('input[type="email"]').fill('test@fms.com')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('differentpassword')
    
    const signUpButton = page.locator('button:has-text("Sign Up")')
    await signUpButton.click()
    
    // Should show error message
    await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 5000 })
  })

  test('should show error for short password', async ({ page }) => {
    await page.locator('input[type="text"]').fill('Test User')
    await page.locator('input[type="email"]').fill('test@fms.com')
    await page.locator('input[type="password"]').first().fill('12345')
    await page.locator('input[type="password"]').nth(1).fill('12345')
    
    const signUpButton = page.locator('button:has-text("Sign Up")')
    await signUpButton.click()
    
    // Should show error for password length
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible({ timeout: 5000 })
  })

  test('should allow role selection', async ({ page }) => {
    const roleSelect = page.locator('select')
    
    // Check available roles
    const options = await roleSelect.locator('option').allTextContents()
    expect(options).toContain('Support Agent')
    expect(options).toContain('Operations Admin')
    expect(options).toContain('Finance Admin')
    expect(options).toContain('Compliance Officer')
    expect(options).toContain('Super Admin')
    
    // Select a role
    await roleSelect.selectOption('Operations Admin')
    await expect(roleSelect).toHaveValue('Operations Admin')
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInputs = page.locator('input[type="password"]')
    
    // Fill passwords
    await passwordInputs.first().fill('password123')
    await passwordInputs.nth(1).fill('password123')
    
    // Toggle first password
    const toggleButtons = page.locator('button').filter({ has: page.locator('svg') })
    await toggleButtons.first().click()
    
    // First password should be visible
    await expect(passwordInputs.first()).toHaveAttribute('type', 'text')
    // Second should still be password
    await expect(passwordInputs.nth(1)).toHaveAttribute('type', 'password')
  })

  test('should require terms acceptance', async ({ page }) => {
    await page.locator('input[type="text"]').fill('Test User')
    await page.locator('input[type="email"]').fill('test@fms.com')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('password123')
    
    const signUpButton = page.locator('button:has-text("Sign Up")')
    await signUpButton.click()
    
    // HTML5 validation should prevent submission without checkbox
    const checkbox = page.locator('input[type="checkbox"]').last()
    const isRequired = await checkbox.evaluate((el: HTMLInputElement) => el.validity.valueMissing)
    expect(isRequired).toBe(true)
  })

  test('should navigate to login page', async ({ page }) => {
    const signInLink = page.locator('a:has-text("Sign in")')
    await signInLink.click()
    
    await expect(page).toHaveURL('/login')
    await expect(page.locator('text=Welcome Back')).toBeVisible()
  })

  test('should successfully signup with valid data', async ({ page }) => {
    await page.locator('input[type="text"]').fill('New Admin')
    await page.locator('input[type="email"]').fill('newadmin@fms.com')
    await page.locator('select').selectOption('Support Agent')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.locator('input[type="password"]').nth(1).fill('password123')
    await page.locator('input[type="checkbox"]').last().check()
    
    const signUpButton = page.locator('button:has-text("Sign Up")')
    await signUpButton.click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})
