/**
 * Pricing & Commission Management API Schemas
 */

export interface ServicePricingListRequest {
  page?: number
  limit?: number
  search?: string
  city?: string
  serviceCategory?: string
  status?: 'Active' | 'Inactive'
}

export interface ServicePricingListResponse {
  success: boolean
  data: ServicePricing[]
  pagination: Pagination
}

export interface ServicePricing {
  id: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  city: string
  state: string
  basePrice: number
  currency: string
  surgeMultiplier: number
  providerCommission: number // percentage
  vendorCommission: number // percentage
  platformCommission: number // percentage (calculated)
  status: 'Active' | 'Inactive'
  version: number
  effectiveFrom: string
  effectiveTo?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateServicePricingRequest {
  serviceId: string
  city: string
  basePrice: number
  surgeMultiplier: number
  providerCommission: number
  vendorCommission: number
  effectiveFrom: string
  effectiveTo?: string
}

export interface CreateServicePricingResponse {
  success: boolean
  message: string
  data: ServicePricing
}

export interface UpdateServicePricingRequest {
  pricingId: string
  basePrice?: number
  surgeMultiplier?: number
  providerCommission?: number
  vendorCommission?: number
  status?: 'Active' | 'Inactive'
  effectiveFrom?: string
  effectiveTo?: string
}

export interface UpdateServicePricingResponse {
  success: boolean
  message: string
  data: ServicePricing
}

export interface SurgePricingRuleListRequest {
  page?: number
  limit?: number
  status?: 'Active' | 'Inactive'
}

export interface SurgePricingRuleListResponse {
  success: boolean
  data: SurgePricingRule[]
  pagination: Pagination
}

export interface SurgePricingRule {
  id: string
  name: string
  description?: string
  multiplier: number
  days: string[] // ['Mon', 'Tue', 'Wed', ...] or ['Public Holidays']
  timeFrom?: string // '09:00'
  timeTo?: string // '18:00'
  cities?: string[] // empty array means all cities
  serviceCategories?: string[] // empty array means all services
  status: 'Active' | 'Inactive'
  priority: number // higher priority rules apply first
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateSurgeRuleRequest {
  name: string
  description?: string
  multiplier: number
  days: string[]
  timeFrom?: string
  timeTo?: string
  cities?: string[]
  serviceCategories?: string[]
  priority: number
}

export interface CreateSurgeRuleResponse {
  success: boolean
  message: string
  data: SurgePricingRule
}

export interface UpdateSurgeRuleRequest {
  ruleId: string
  name?: string
  description?: string
  multiplier?: number
  days?: string[]
  timeFrom?: string
  timeTo?: string
  cities?: string[]
  serviceCategories?: string[]
  status?: 'Active' | 'Inactive'
  priority?: number
}

export interface UpdateSurgeRuleResponse {
  success: boolean
  message: string
  data: SurgePricingRule
}

export interface DeleteSurgeRuleRequest {
  ruleId: string
}

export interface DeleteSurgeRuleResponse {
  success: boolean
  message: string
}

export interface CommissionStructureRequest {
  defaultProviderCommission: number
  defaultVendorCommission: number
  serviceCategoryOverrides?: ServiceCategoryCommission[]
}

export interface ServiceCategoryCommission {
  category: string
  providerCommission: number
  vendorCommission: number
}

export interface CommissionStructureResponse {
  success: boolean
  message: string
  data: {
    defaultProviderCommission: number
    defaultVendorCommission: number
    defaultPlatformCommission: number
    serviceCategoryOverrides: ServiceCategoryCommission[]
    updatedAt: string
  }
}

export interface PricingHistoryRequest {
  pricingId: string
  page?: number
  limit?: number
}

export interface PricingHistoryResponse {
  success: boolean
  data: PricingHistoryEntry[]
  pagination: Pagination
}

export interface PricingHistoryEntry {
  id: string
  pricingId: string
  version: number
  changes: Record<string, { old: any; new: any }>
  changedBy: string
  changedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
