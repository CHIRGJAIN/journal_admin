/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { apiClient } from '@/lib/apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '@/types/auth.types';

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(payload: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', payload);
  }

  /**
   * Login user
   */
  async loginUser(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/login', payload);
    // Backend responds with { status: true, data: { token, user } }
    return res && res.data ? res.data : res;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const res = await apiClient.get<any>('/auth/profile', true, { withCredentials: true });
    // Backend responds with { status: true, data: user }
    return res && res.data ? res.data : res;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
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
