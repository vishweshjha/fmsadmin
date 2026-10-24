import apiClient from './apiClient'

export interface CookMenuItemIngredient {
  id?: string
  cookMenuItemId?: string
  name: string
  quantity: string
  imageUrl?: string | null
  orderIndex?: number
  createdAt?: string
  updatedAt?: string
}

export interface CookMenuItem {
  id: string
  name: string
  category: string // Breakfast, Lunch, Dinner, Snacks, Beverages
  isVeg: boolean
  badge?: string | null
  imageUrl: string
  description?: string | null
  price?: number | string | null
  orderIndex: number
  isActive: boolean
  serviceItemId?: string | null
  serviceItem?: {
    id: string
    name: string
  } | null
  cuisineType?: string | null
  prepTimeText?: string | null
  servingsText?: string | null
  ingredients?: CookMenuItemIngredient[]
  createdAt?: string
  updatedAt?: string
}

export interface CookMenuCategoryItem {
  id: string
  name: string
  imageUrl: string
  itemCount: number
}

export interface ServiceItemOption {
  id: string
  name: string
  description?: string
  price?: number | string
  categoryId?: string
}

export const fetchCookMenuItemsAdmin = async (params?: {
  category?: string
  isVeg?: boolean | string
  search?: string
  serviceItemId?: string
}): Promise<CookMenuItem[]> => {
  try {
    const query = new URLSearchParams()
    if (params?.category && params.category !== 'all') query.append('category', params.category)
    if (params?.isVeg !== undefined && params.isVeg !== '') query.append('isVeg', String(params.isVeg))
    if (params?.search) query.append('search', params.search)
    if (params?.serviceItemId) query.append('serviceItemId', params.serviceItemId)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    const res = await apiClient.get<any>(`/cook-menu/admin${queryString}`)
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res.data)) return res.data
    return []
  } catch (err) {
    console.error('Error fetching cook menu items:', err)
    throw err
  }
}

export const fetchCookMenuCategories = async (): Promise<CookMenuCategoryItem[]> => {
  try {
    const res = await apiClient.get<any>('/cook-menu/categories')
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res.data)) return res.data
    return []
  } catch (err) {
    console.error('Error fetching cook menu categories:', err)
    throw err
  }
}

export const fetchServiceItemsList = async (): Promise<ServiceItemOption[]> => {
  try {
    const res = await apiClient.get<any>('/services/items')
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res.data)) return res.data
    return []
  } catch (err) {
    console.error('Error fetching service items:', err)
    return []
  }
}

export const createCookMenuItem = async (
  data: Partial<CookMenuItem>
): Promise<CookMenuItem> => {
  const res = await apiClient.post<any>('/cook-menu', data)
  return res.data || res
}

export const updateCookMenuItem = async (
  id: string,
  data: Partial<CookMenuItem>
): Promise<CookMenuItem> => {
  const res = await apiClient.put<any>(`/cook-menu/${id}`, data)
  return res.data || res
}

export const toggleCookMenuItemStatus = async (id: string): Promise<CookMenuItem> => {
  const res = await apiClient.patch<any>(`/cook-menu/${id}/toggle`, {})
  return res.data || res
}

export const deleteCookMenuItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/cook-menu/${id}`)
}

export const addCookMenuItemIngredient = async (
  cookMenuItemId: string,
  ingredient: Partial<CookMenuItemIngredient>
): Promise<CookMenuItemIngredient> => {
  const res = await apiClient.post<any>(`/cook-menu/${cookMenuItemId}/ingredients`, ingredient)
  return res.data || res
}

export const updateCookMenuItemIngredient = async (
  ingredientId: string,
  ingredient: Partial<CookMenuItemIngredient>
): Promise<CookMenuItemIngredient> => {
  const res = await apiClient.put<any>(`/cook-menu/ingredients/${ingredientId}`, ingredient)
  return res.data || res
}

export const deleteCookMenuItemIngredient = async (ingredientId: string): Promise<void> => {
  await apiClient.delete(`/cook-menu/ingredients/${ingredientId}`)
}

