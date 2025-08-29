import axios from 'axios'

// Create axios instance for auth endpoints
export const authApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Create axios instance for authenticated endpoints
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: (startDate?: string, endDate?: string) => 
    api.get('/dashboard/analytics', { params: { startDate, endDate } }),
  getRecentActivity: (limit?: number) => 
    api.get('/dashboard/recent-activity', { params: { limit } }),
}

// Restaurant API
export const restaurantApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    city?: string
    status?: string
    cuisine?: string
  }) => api.get('/restaurants', { params }),
  
  getById: (id: number) => api.get(`/restaurants/${id}`),
  
  getOrders: (id: number, params?: {
    page?: number
    limit?: number
    status?: string
    paymentStatus?: string
    startDate?: string
    endDate?: string
  }) => api.get(`/restaurants/${id}/orders`, { params }),
  
  getPayments: (id: number) => api.get(`/restaurants/${id}/payments`),
  
  update: (id: number, data: any) => api.put(`/restaurants/${id}`, data),
}

// Payment API
export const paymentApi = {
  getMonthly: (month?: number, year?: number) => 
    api.get('/payments/monthly', { params: { month, year } }),
  
  settle: (data: { month: number; year: number; restaurantIds?: number[] }) => 
    api.post('/payments/settle', data),
  
  getHistory: (params?: {
    page?: number
    limit?: number
    month?: number
    year?: number
    status?: string
    restaurantId?: number
  }) => api.get('/payments/history', { params }),
}

// Support API
export const supportApi = {
  getTickets: (params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    category?: string
    search?: string
    assignedTo?: number
  }) => api.get('/support/tickets', { params }),
  
  createTicket: (data: any) => api.post('/support/tickets', data),
  
  getTicket: (id: number) => api.get(`/support/tickets/${id}`),
  
  updateTicket: (id: number, data: any) => api.put(`/support/tickets/${id}`, data),
  
  getStats: () => api.get('/support/stats'),
  
  getAgents: () => api.get('/support/agents'),
}

export default api
