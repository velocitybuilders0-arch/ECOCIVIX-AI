import { apiClient } from './client';
import type { LoginCredentials, SignupCredentials, AuthSession, User } from '../../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return apiClient.post<AuthSession>('/api/auth/login', credentials);
  },

  async signup(credentials: SignupCredentials): Promise<AuthSession> {
    return apiClient.post<AuthSession>('/api/auth/signup', credentials);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/api/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/me');
  },

  async refreshToken(): Promise<AuthSession> {
    return apiClient.post<AuthSession>('/api/auth/refresh');
  },
};
