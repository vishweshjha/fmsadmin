import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ServiceProviderManagement from '../ServiceProviderManagement'

// Mock the API services
vi.mock('../../services/gyorsApi', () => ({
  fetchServiceProviders: vi.fn(() => Promise.resolve([])),
  fetchCategories: vi.fn(() => Promise.resolve([])),
  fetchServiceItems: vi.fn(() => Promise.resolve([])),
  createServiceProvider: vi.fn(),
  updateServiceProvider: vi.fn(),
  updateServiceProviderStatus: vi.fn(),
  deleteServiceProvider: vi.fn(),
}))

describe('ServiceProviderManagement', () => {
  it('renders the page title', async () => {
    render(<ServiceProviderManagement />)
    
    const title = screen.getByRole('heading', { level: 1, name: /Service Providers/i })
    expect(title).toBeInTheDocument()
    
    const subtitle = screen.getByText(/Manage all service provider accounts/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders the stats cards', () => {
    render(<ServiceProviderManagement />)
    
    expect(screen.getByText(/Total Providers/i)).toBeInTheDocument()
    // There are multiple "Active" texts (stats and badges)
    expect(screen.getAllByText(/Active/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Pending/i)[0]).toBeInTheDocument()
  })
})
