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

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return {
      user: response.data.user,
      token: response.data.access_token,
    };
  },

  async getCurrentUser() {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  async signup(email: string, password: string, fullName: string) {
    const response = await api.post('/api/v1/auth/signup', {
      email,
      password,
      fullName,
    });
    return response.data;
  },
};