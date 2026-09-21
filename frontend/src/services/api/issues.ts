import { apiClient } from './client';
import type { Issue, CreateIssueInput, UpdateStatusInput, DualAIAnalysisResult } from '../../types/issues';

export const issuesService = {
  async analyzeIssue(
    title: string,
    description: string,
    locationContext?: string,
    imageUrl?: string
  ): Promise<DualAIAnalysisResult> {
    return apiClient.post<DualAIAnalysisResult>('/api/issues/analyze', {
      title,
      description,
      locationContext,
      imageUrl,
    });
  },

  async createIssue(data: CreateIssueInput): Promise<{ issue: Issue }> {
    return apiClient.post<{ issue: Issue }>('/api/issues', data);
  },

  async getIssues(filters?: {
    status?: string;
    citizenId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ issues: Issue[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.citizenId) params.append('citizenId', filters.citizenId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const query = params.toString();
    return apiClient.get<{ issues: Issue[]; count: number }>(
      `/api/issues${query ? `?${query}` : ''}`
    );
  },

  async getIssueById(id: string): Promise<{ issue: Issue }> {
    return apiClient.get<{ issue: Issue }>(`/api/issues/${id}`);
  },

  async updateStatus(id: string, data: UpdateStatusInput): Promise<{ issue: Issue }> {
    return apiClient.patch<{ issue: Issue }>(`/api/issues/${id}/status`, data);
  },
};
