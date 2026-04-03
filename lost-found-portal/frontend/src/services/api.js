import axios from 'axios';

const api = axios.create({
  baseURL: "https://lost-found-portal-82up.onrender.com",
  timeout: 15000,
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') ||
                          error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  search: (params) => api.get('/items/search', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (formData) => api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/items/${id}`),
  getMyItems: (params) => api.get('/items/my-items', { params }),
  resolve: (id) => api.put(`/items/${id}/resolve`),
  report: (id) => api.post(`/items/${id}/report`),
};

export const messagesAPI = {
  getAll: () => api.get('/messages'),
  send: (data) => api.post('/messages', data),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getAllItems: (params) => api.get('/admin/items', { params }),
  toggleItemVisibility: (id) => api.put(`/admin/items/${id}/visibility`),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
};

export default api;
