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

class EditorialBoardService {
  /**
   * Get all editorial board members
   */
  async getAllMembers(params?: GetEditorialBoardParams): Promise<any> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());

    const endpoint = query.toString() ? `/editorial-board?${query.toString()}` : '/editorial-board';
    return apiClient.get<any>(endpoint);
  }

  /**
   * Get single editorial board member by ID
   */
  async getMember(id: string): Promise<EditorialBoardMember> {
    return apiClient.get<EditorialBoardMember>(`/editorial-board/${id}`);
  }
}

export const editorialBoardService = new EditorialBoardService();
