/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { apiClient } from '@/lib/apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '@/types/auth.types';

type ApiEnvelope<T> = {
  status?: boolean;
  data?: T;
};

type LoginPayload = {
  access_token: string;
  user: User;
};

const unwrapData = <T>(response: ApiEnvelope<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
};

const normalizeAuthResponse = (payload: any): AuthResponse => {
  if (payload?.data?.access_token) {
    return { token: payload.data.access_token, user: payload.data.user };
  }
  if (payload?.access_token) {
    return { token: payload.access_token, user: payload.user };
  }
  if (payload?.token) {
    return { token: payload.token, user: payload.user };
  }
  return payload as AuthResponse;
};

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(payload: RegisterRequest): Promise<User> {
    const response = await apiClient.post<ApiEnvelope<User>>('/auth/register', payload);
    return unwrapData<User>(response);
  }

  /**
   * Login user
   */
  async loginUser(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiEnvelope<LoginPayload>>('/auth/login', payload);
    return normalizeAuthResponse(response);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiEnvelope<User>>('/auth/profile', true, { withCredentials: true });
    return unwrapData<User>(response);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // Optionally call backend logout endpoint
    // await apiClient.post('/auth/logout', {});
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', {});
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/password-reset', { email });
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/password-reset-confirm', { token, password });
  }
}

export const authService = new AuthService();
