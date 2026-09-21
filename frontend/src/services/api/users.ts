import { apiClient } from './client';
import type { User } from '../../types/auth';

export const usersService = {
  async getUsers(filters?: {
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const query = params.toString();
    return apiClient.get<{ users: User[]; count: number }>(
      `/api/users${query ? `?${query}` : ''}`
    );
  },

  async getUserById(id: string): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>(`/api/users/${id}`);
  },

  async updateUserRole(id: string, role: string): Promise<{ user: User }> {
    return apiClient.patch<{ user: User }>(`/api/users/${id}/role`, { role });
  },
};
