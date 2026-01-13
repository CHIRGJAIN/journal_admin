/**
 * User Service
 * Handles user-related API calls
 */

import { apiClient } from '@/lib/apiClient';
import type { User } from '@/types/auth.types';

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
    return apiClient.get<User>(`/users/${userId}`);
  }

  /**
   * Update current user profile
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>('/users/profile', payload);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[] }> {
    return apiClient.get<{ users: User[] }>(`/users?page=${page}&limit=${limit}`);
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/users/profile');
  }
}

export const userService = new UserService();
