/**
 * API Client Helper for E2E Tests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      validateStatus: () => true, // Don't throw on any status
    });
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

// Service-specific clients
export const getAuthClient = () => new ApiClient({
  baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
});

export const getHealthcareClient = () => new ApiClient({
  baseURL: process.env.HEALTHCARE_SERVICE_URL || 'http://localhost:3002',
});

export const getEducationClient = () => new ApiClient({
  baseURL: process.env.EDUCATION_SERVICE_URL || 'http://localhost:3003',
});

export const getEconomicClient = () => new ApiClient({
  baseURL: process.env.ECONOMIC_SERVICE_URL || 'http://localhost:3004',
});

export const getDataAnalyticsClient = () => new ApiClient({
  baseURL: process.env.DATA_ANALYTICS_SERVICE_URL || 'http://localhost:3005',
});

export const getCrisisClient = () => new ApiClient({
  baseURL: process.env.CRISIS_SERVICE_URL || 'http://localhost:3006',
});

export const getAIMLClient = () => new ApiClient({
  baseURL: process.env.AI_ML_SERVICE_URL || 'http://localhost:8000',
});
