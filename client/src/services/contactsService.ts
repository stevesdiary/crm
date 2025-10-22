import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const contactsService = {
  async getContacts(params: { search?: string; page?: number; limit?: number }) {
    const response = await api.get('/api/v1/contacts', { params });
    return response.data;
  },

  async getContact(id: string) {
    const response = await api.get(`/api/v1/contacts/${id}`);
    return response.data;
  },

  async createContact(data: any) {
    const response = await api.post('/api/v1/contacts', data);
    return response.data;
  },

  async updateContact(id: string, data: any) {
    const response = await api.patch(`/api/v1/contacts/${id}`, data);
    return response.data;
  },

  async deleteContact(id: string) {
    const response = await api.delete(`/api/v1/contacts/${id}`);
    return response.data;
  },

  async importContacts(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async exportContacts() {
    const response = await api.get('/api/v1/contacts/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};