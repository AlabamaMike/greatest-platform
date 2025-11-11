import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API client functions
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),

  getProfile: () =>
    api.get('/api/v1/auth/profile'),

  logout: () =>
    api.post('/api/v1/auth/logout'),
};

export const healthcareAPI = {
  getAppointments: (params?: any) =>
    api.get('/api/v1/healthcare/appointments', { params }),

  createAppointment: (data: any) =>
    api.post('/api/v1/healthcare/appointments', data),

  getProviders: () =>
    api.get('/api/v1/healthcare/providers'),

  getTrainingModules: () =>
    api.get('/api/v1/healthcare/training/modules'),
};

export const educationAPI = {
  getCourses: () =>
    api.get('/api/v1/education/courses'),

  getCourse: (id: string) =>
    api.get(`/api/v1/education/courses/${id}`),

  enroll: (data: { courseId: string; userId: string }) =>
    api.post('/api/v1/education/enrollments', data),

  getProgress: (id: string) =>
    api.get(`/api/v1/education/enrollments/${id}/progress`),

  getCertificates: () =>
    api.get('/api/v1/education/certificates'),
};

export const economicAPI = {
  getJobs: () =>
    api.get('/api/v1/economic/jobs'),

  applyForJob: (data: any) =>
    api.post('/api/v1/economic/applications', data),

  applyForLoan: (data: any) =>
    api.post('/api/v1/economic/loans/apply', data),

  getWalletBalance: () =>
    api.get('/api/v1/economic/wallet/balance'),

  transfer: (data: { to: string; amount: number }) =>
    api.post('/api/v1/economic/wallet/transfer', data),

  getWomenPrograms: () =>
    api.get('/api/v1/economic/women-programs'),
};

export const dataAPI = {
  getSDG: (goal: number) =>
    api.get(`/api/v1/data/sdg/${goal}`),

  getAllIndicators: () =>
    api.get('/api/v1/data/indicators'),

  getImpact: () =>
    api.get('/api/v1/data/impact'),

  getDashboard: (id: string) =>
    api.get(`/api/v1/data/dashboards/${id}`),

  predict: (modelType: string) =>
    api.post('/api/v1/data/predict', { model_type: modelType }),
};

export const crisisAPI = {
  getIncidents: () =>
    api.get('/api/v1/crisis/incidents'),

  reportIncident: (data: any) =>
    api.post('/api/v1/crisis/incidents', data),

  getCrisisMap: () =>
    api.get('/api/v1/crisis/map'),

  getAlerts: () =>
    api.get('/api/v1/crisis/alerts'),

  registerVolunteer: (data: any) =>
    api.post('/api/v1/crisis/volunteers', data),
};

export const aiAPI = {
  translate: (data: { text: string; source_lang: string; target_lang: string }) =>
    api.post('/api/v1/ai/translate', data),

  recommend: (data: { user_id: string; context: string; limit?: number }) =>
    api.post('/api/v1/ai/recommend', data),
};
