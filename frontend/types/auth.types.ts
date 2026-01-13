/**
 * Authentication-related types
 */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roles?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}
