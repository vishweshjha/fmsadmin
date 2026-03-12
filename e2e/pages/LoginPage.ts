import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly signUpLink: Locator
  readonly forgotPasswordLink: Locator
  readonly rememberMeCheckbox: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.signInButton = page.locator('button:has-text("Sign In")')
    this.signUpLink = page.locator('a:has-text("Sign up")')
    this.forgotPasswordLink = page.locator('a:has-text("Forgot password")')
    this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first()
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }

  async togglePasswordVisibility() {
    const toggleButton = this.page.locator('button').filter({ has: this.page.locator('svg') }).first()
    await toggleButton.click()
  }
}
