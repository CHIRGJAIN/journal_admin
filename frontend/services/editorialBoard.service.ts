/**
 * Editorial Board Service
 * Handles editorial board member-related API calls
 */

import { apiClient } from '@/lib/apiClient';

export interface EditorialBoardMember {
  id: string;
  name: string;
  role: string;
  institution: string;
  country?: string;
  email?: string;
  bio?: string;
  expertise?: string[];
  image?: string;
  isActive?: boolean;
}

export interface GetEditorialBoardParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface EditorialBoardListResponse {
  data: EditorialBoardMember[];
  status?: boolean;
}

class EditorialBoardService {
  /**
   * Get all editorial board members
   */
  async getAllMembers(params?: GetEditorialBoardParams): Promise<EditorialBoardListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());

    const endpoint = query.toString() ? `/editorial-board?${query.toString()}` : '/editorial-board';
    const res = await apiClient.get<any>(endpoint);
    const data = res && res.data ? res.data : res;
    return { data: Array.isArray(data) ? data : [], status: res?.status };
  }

  /**
   * Get single editorial board member by ID
   */
  async getMember(id: string): Promise<EditorialBoardMember> {
    const res = await apiClient.get<any>(`/editorial-board/${id}`);
    return res && res.data ? res.data : res;
  }

  /**
   * Create editorial board member
   */
  async createMember(payload: Omit<EditorialBoardMember, 'id'>): Promise<EditorialBoardMember> {
    const res = await apiClient.post<any>('/editorial-board', payload);
    return res && res.data ? res.data : res;
  }

  /**
   * Update editorial board member
   */
  async updateMember(id: string, payload: Partial<EditorialBoardMember>): Promise<EditorialBoardMember> {
    const res = await apiClient.put<any>(`/editorial-board/${id}`, payload);
    return res && res.data ? res.data : res;
  }

  /**
   * Delete editorial board member
   */
  async deleteMember(id: string): Promise<EditorialBoardMember> {
    const res = await apiClient.delete<any>(`/editorial-board/${id}`);
    return res && res.data ? res.data : res;
  }
}

export const editorialBoardService = new EditorialBoardService();
