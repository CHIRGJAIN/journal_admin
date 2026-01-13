/**
 * Manuscript Service
 * Handles manuscript submission and management
 */

import { apiClient } from '@/lib/apiClient';

export interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  status: 'draft' | 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'published';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
  keywords?: string[];
}

export interface SubmitManuscriptRequest {
  title: string;
  abstract: string;
  authors: string[];
  content: string;
  keywords?: string[];
}

class ManuscriptService {
  async getTypes(): Promise<string[]> {
    const res = await apiClient.get<{ status?: boolean; data?: string[]; types?: string[] }>(`/manuscripts/types`);
    return res.data ?? res.types ?? [];
  }

  async searchPublic(params: { q?: string; type?: string; issueSlug?: string; page?: number; limit?: number }): Promise<{ data: Manuscript[]; total: number; meta?: any; status?: boolean; }>
  {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.type) query.append('type', params.type);
    if (params.issueSlug) query.append('issueSlug', params.issueSlug);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const endpoint = query.toString() ? `/manuscripts/public?${query.toString()}` : '/manuscripts/public';
    return apiClient.get(endpoint);
  }

  /**
   * Get a single published/accepted manuscript publicly (no auth)
   */
  async getPublicManuscript(id: string): Promise<Manuscript> {
    return apiClient.get<Manuscript>(`/manuscripts/public/${id}`);
  }

  /**
   * Get all manuscripts for current user
   */
  async getMyManuscripts(): Promise<Manuscript[]> {
    return apiClient.get<Manuscript[]>('/manuscripts');
  }

  /**
   * Get manuscript by ID
   */
  async getManuscript(id: string): Promise<Manuscript> {
    return apiClient.get<Manuscript>(`/manuscripts/${id}`);
  }

  /**
   * Submit new manuscript
   */
  async submitManuscript(payload: SubmitManuscriptRequest): Promise<Manuscript> {
    return apiClient.post<Manuscript>('/manuscripts', payload);
  }

  /**
   * Submit manuscript with multipart FormData (files + metadata)
   */
  async submitManuscriptWithFiles(formData: FormData): Promise<any> {
    return apiClient.postForm('/manuscripts/create', formData, { withCredentials: true });
  }

  /**
   * Update manuscript draft
   */
  async updateManuscript(id: string, payload: Partial<SubmitManuscriptRequest>): Promise<Manuscript> {
    return apiClient.put<Manuscript>(`/manuscripts/${id}`, payload);
  }

  /**
   * Delete manuscript
   */
  async deleteManuscript(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/manuscripts/${id}`);
  }

  /**
   * Withdraw manuscript submission
   */
  async withdrawSubmission(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/manuscripts/${id}/withdraw`, {});
  }
}

export const manuscriptService = new ManuscriptService();
