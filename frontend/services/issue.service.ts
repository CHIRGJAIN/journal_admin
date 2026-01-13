/**
 * Issue Service
 * Handles journal issue-related API calls
 */

import { apiClient } from '@/lib/apiClient';

export interface Issue {
  id: string;
  volume: number;
  issueNumber: number;
  year?: number;
  month?: string;
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  publicationDate?: string;
  publishedAt?: string;
  articles?: Article[];
  keywords?: string[];
  totalPages?: number;
  manuscripts?: { _id: string }[];
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pages?: string;
  doi?: string;
}

export interface GetIssuesParams {
  page?: number;
  limit?: number;
  year?: number;
  volume?: number;
  status?: string;
}

export interface GetIssuesResponse {
  status?: boolean;
  data?: Issue[];
  issues?: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

class IssueService {
  /**
   * Get all issues with optional filters
   */
  async getAllIssues(params?: GetIssuesParams): Promise<GetIssuesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.year) query.append('year', params.year.toString());
    if (params?.volume) query.append('volume', params.volume.toString());
    if (params?.status) query.append('status', params.status);

    const endpoint = query.toString() ? `/issues?${query.toString()}` : '/issues';
    return apiClient.get<GetIssuesResponse>(endpoint);
  }

  /**
   * Get single issue by ID
   */
  async getIssue(id: string): Promise<Issue> {
    return apiClient.get<Issue>(`/issues/${id}`);
  }

  /**
   * Get latest issue
   */
  async getLatestIssue(): Promise<Issue> {
    return apiClient.get<Issue>('/issues/latest');
  }

  /**
   * Get issue by volume and number
   */
  async getIssueByVolume(volume: number, number: number): Promise<Issue> {
    return apiClient.get<Issue>(`/issues/volume/${volume}/number/${number}`);
  }

  /**
   * Search issues
   */
  async searchIssues(query: string): Promise<{ issues: Issue[] }> {
    return apiClient.get<{ issues: Issue[] }>(`/issues/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get featured manuscripts from all issues
   */
  async getFeaturedManuscripts(): Promise<any> {
    return apiClient.get<any>('/issues/featured-manuscripts');
  }
}

export const issueService = new IssueService();
