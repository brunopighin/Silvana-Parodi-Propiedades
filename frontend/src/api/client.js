import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Interceptor: agregar token de sesión Supabase a cada request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Interceptor: manejar 401 (sesión expirada o inválida)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        await supabase.auth.signOut();
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Properties
export const propertiesApi = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/by-id/${id}`),
  getFeatured: () => api.get('/properties/featured'),
  getBySlug: (slug) => api.get(`/properties/${slug}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/properties/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  deleteImage: (propertyId, imageId) =>
    api.delete(`/properties/${propertyId}/images/${imageId}`),
  reorderImages: (propertyId, images) =>
    api.put(`/properties/${propertyId}/images/reorder`, { images }),
  setMainImage: (propertyId, imageId) =>
    api.put(`/properties/${propertyId}/images/${imageId}/main`),
  uploadVideo: (id, formData, onProgress) =>
    api.post(`/properties/${id}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  deleteVideo: (id) => api.delete(`/properties/${id}/video`),
};

// Inquiries
export const inquiriesApi = {
  create: (data) => api.post('/inquiries', data),
  getAll: (params) => api.get('/inquiries', { params }),
  getStats: () => api.get('/inquiries/stats/count'),
  markRead: (id) => api.put(`/inquiries/${id}/read`),
  archive: (id) => api.put(`/inquiries/${id}/archive`),
  delete: (id) => api.delete(`/inquiries/${id}`),
};

// Testimonials
export const testimonialsApi = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/all'),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

// Settings
export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Auth
export const authApi = {
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export default api;
