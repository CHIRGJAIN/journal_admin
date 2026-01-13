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
    return apiClient.post<AuthResponse>('/auth/login', payload);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile', true, { withCredentials: true });
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
