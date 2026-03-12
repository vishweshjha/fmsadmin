import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly statsCards: Locator
  readonly recentBookingsTable: Locator
  readonly productivityChart: Locator
  readonly quickStats: Locator

  constructor(page: Page) {
    this.page = page
    this.statsCards = page.locator('[class*="bg-white rounded-lg shadow"]').filter({ has: page.locator('text=/Total Bookings|Active Users|Revenue|Pending KYC/') })
    this.recentBookingsTable = page.locator('table')
    this.productivityChart = page.locator('svg').first()
    this.quickStats = page.locator('text=Quick Stats')
  }

  async goto() {
    await this.page.goto('/')
  }

  async waitForDataLoad() {
    // Wait for either loading to finish or data to appear
    await Promise.race([
      this.page.waitForSelector('text=Total Bookings', { state: 'visible' }),
      this.page.waitForTimeout(5000), // Max wait 5 seconds
    ])
  }

  async navigateToMenuItem(menuItem: string) {
    await this.page.locator(`text=${menuItem}`).click()
  }

  async logout() {
    await this.page.locator('button:has-text("Logout")').click()
  }

  async getStatValue(statName: string): Promise<string | null> {
    const statCard = this.page.locator(`text=${statName}`).locator('..')
    const valueElement = statCard.locator('text=/\\d+/').first()
    return await valueElement.textContent()
  }

  async refreshData() {
    await this.page.reload()
    await this.waitForDataLoad()
  }
}
