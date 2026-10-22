import apiClient from './apiClient'

export interface CookTimeGuide {
  id: string
  peopleCountText: string
  dishesCountText: string
  durationText: string
  durationMinutes: number
  orderIndex: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export const fetchCookGuideRules = async (): Promise<CookTimeGuide[]> => {
  try {
    const res = await apiClient.get<any>('/cook-time-guide/admin')
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res.data)) return res.data
    return []
  } catch (err) {
    console.error('Error fetching cook time guide rules:', err)
    throw err
  }
}

export const createCookGuideRule = async (
  data: Omit<CookTimeGuide, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CookTimeGuide> => {
  const res = await apiClient.post<any>('/cook-time-guide', data)
  return res.data || res
}

export const updateCookGuideRule = async (
  id: string,
  data: Partial<CookTimeGuide>
): Promise<CookTimeGuide> => {
  const res = await apiClient.put<any>(`/cook-time-guide/${id}`, data)
  return res.data || res
}

export const toggleCookGuideRuleStatus = async (id: string): Promise<CookTimeGuide> => {
  const res = await apiClient.patch<any>(`/cook-time-guide/${id}/toggle`, {})
  return res.data || res
}

export const deleteCookGuideRule = async (id: string): Promise<void> => {
  await apiClient.delete(`/cook-time-guide/${id}`)
}
