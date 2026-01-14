/**
 * Manuscript Service
 * Handles manuscript submission and management
 */

import { apiClient } from '@/lib/apiClient';

type ApiEnvelope<T> = {
  status?: boolean;
  data?: T;
  meta?: any;
};

const unwrapData = <T>(response: ApiEnvelope<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
};

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

export type ManuscriptListResponse = {
  data: Manuscript[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  status?: boolean;
};

export interface SubmitManuscriptRequest {
  title: string;
  abstract: string;
  authors: string[];
  content: string;
  keywords?: string[];
}

class ManuscriptService {
  async getAll(params?: { page?: number; limit?: number }): Promise<ManuscriptListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const endpoint = query.toString() ? `/manuscripts?${query.toString()}` : '/manuscripts';
    const res = await apiClient.get<any>(endpoint);

    if (Array.isArray(res)) {
      return { data: res };
    }

    const { data, meta, status } = res ?? {};
    return { data: data ?? [], meta, status };
  }

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
    const response = await apiClient.get<ApiEnvelope<Manuscript>>(`/manuscripts/public/${id}`);
    return unwrapData<Manuscript>(response);
  }

  /**
   * Get all manuscripts for current user
   * @param statuses - Optional array of status values to filter by
   */
  async getMyManuscripts(statuses?: string[]): Promise<Manuscript[]> {
    let endpoint = '/manuscripts/my';
    if (statuses && statuses.length > 0) {
      const query = statuses.map(s => `status=${encodeURIComponent(s)}`).join('&');
      endpoint += `?${query}`;
    }
    const res = await apiClient.get<any>(endpoint);
    return res.data ?? res ?? [];
  }

  /**
   * Get summary counts for current user (total, awaitingCount, decisionCount)
   */
  async getMySummary(): Promise<{ total: number; awaitingCount: number; decisionCount: number }> {
    const res = await apiClient.get<any>('/manuscripts/my/summary');
    return res.data ?? res;
  }

  /**
   * Get manuscript by ID
   */
  async getManuscript(id: string): Promise<Manuscript> {
    const response = await apiClient.get<ApiEnvelope<Manuscript>>(`/manuscripts/${id}`);
    return unwrapData<Manuscript>(response);
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

  /**
   * Update manuscript status
   */
  async updateManuscriptStatus(id: string, status: string): Promise<Manuscript> {
    return apiClient.patch<Manuscript>(`/manuscripts/${id}/status`, { status });
  }
}

export const manuscriptService = new ManuscriptService();
