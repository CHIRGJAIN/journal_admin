/**
 * User Service
 * Handles user-related API calls
 */

import { apiClient } from '@/lib/apiClient';
import type { User } from '@/types/auth.types';

type ApiEnvelope<T> = {
  status?: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

const unwrapData = <T>(response: ApiEnvelope<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
};

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
  affiliation?: string;
}

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get<ApiEnvelope<User>>(`/users/${userId}`);
    return unwrapData<User>(response);
  }

  /**
   * Update current user profile
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiEnvelope<User>>('/users/profile', payload);
    return unwrapData<User>(response);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<ApiEnvelope<User[]>> {
    return apiClient.get<ApiEnvelope<User[]>>(`/users?page=${page}&limit=${limit}`);
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiEnvelope<{ message: string }>>('/users/profile');
    return unwrapData<{ message: string }>(response);
  }

  /**
   * Update user settings (profile fields, unavailableDates)
   */
  async updateSettings(settings: { name?: string; email?: string; phone?: string; unavailableDates?: { ranges: string; note: string } }): Promise<any> {
    const res = await apiClient.put<any>('/auth/settings', settings);
    return res.data ?? res;
  }
}

export const userService = new UserService();
