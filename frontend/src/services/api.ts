import axios from 'axios';

// API base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://finance-admin-be.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    return api.get('/dashboard/stats');
  },
  
  getAnalytics: async (params: { startDate: string; endDate: string }) => {
    return api.get('/dashboard/analytics', { params });
  },
  
  getRecentActivity: async (params: { limit: number }) => {
    return api.get('/dashboard/recent-activity', { params });
  }
};

// Payments API
export const paymentsApi = {
  getAll: async (params: { page: number; limit: number; month?: number; year: number; status?: string }) => {
    return api.get('/payments/monthly', { params });
  },
  
  getAnalytics: async () => {
    return api.get('/payments/analytics');
  },
  
  getMonthly: async (params: { month?: number; year: number }) => {
    return api.get('/payments/monthly', { params });
  },
  
  settle: async (data: { month: number; year: number; restaurantIds: number[] }) => {
    return api.post('/payments/bulk-settlement', data);
  }
};

// Settlements API (weekly)
export const settlementsApi = {
  getWeekly: async (params: { weekStart: string; weekEnd: string }) => {
    return api.get('/settlements/weekly', { params });
  },
  generateWeekly: async (data: { weekStart: string; weekEnd: string; yearWeek?: number }) => {
    return api.post('/settlements/weekly/generate', data);
  },
  initiate: async (id: number) => {
    return api.post(`/settlements/weekly/${id}/initiate`, {});
  },
  markCompleted: async (id: number) => {
    return api.post(`/settlements/weekly/${id}/mark-completed`, {});
  },
};

// Support API
export const supportApi = {
  getTickets: async (params: { page: number; limit: number; search?: string; status?: string; priority?: string; category?: string }) => {
    return api.get('/support/tickets', { params });
  },
  
  getStats: async () => {
    return api.get('/support/stats');
  }
};

// Restaurants API
export const restaurantsApi = {
  getAll: async (params: { page: number; limit: number; search?: string; status?: string; category?: string }) => {
    return api.get('/restaurants', { params });
  }
};

// Users API
export const usersApi = {
  getAll: async (params: { page: number; limit: number; search?: string; status?: string; role?: string }) => {
    return api.get('/users', { params });
  },
  
  getById: async (id: number) => {
    return api.get(`/users/${id}`);
  },
  
  create: async (data: { name: string; email: string; mobile?: string; status?: string }) => {
    return api.post('/users', data);
  },
  
  update: async (id: number, data: { name?: string; email?: string; mobile?: string; status?: string }) => {
    return api.put(`/users/${id}`, data);
  },
  
  delete: async (id: number) => {
    return api.delete(`/users/${id}`);
  },
  
  getStats: async () => {
    return api.get('/users/stats');
  }
};

export default api;
