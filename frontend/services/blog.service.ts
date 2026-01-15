/**
 * Blog Service
 * Handles blog posts and articles
 */

import { apiClient } from '@/lib/apiClient';

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  description: string[];
  category: string;
  tags?: string[];
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogRequest {
  title: string;
  slug?: string;
  description: string[];
  category: string;
  tags?: string[];
  image?: string;
  isActive?: boolean;
}

export interface BlogListResponse {
  data: BlogPost[];
  status?: boolean;
}

class BlogService {
  /**
   * Get all published blog posts
   */
  async getAllPosts(params?: { limit?: number; skip?: number; isActive?: boolean }): Promise<BlogListResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.skip) query.append('skip', params.skip.toString());
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
    const endpoint = query.toString() ? `/blog?${query.toString()}` : '/blog';
    const res = await apiClient.get<any>(endpoint);
    const data = res && res.data ? res.data : res;
    return { data: Array.isArray(data) ? data : [], status: res?.status };
  }

  /**
   * Get single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    const res = await apiClient.get<any>(`/blog/slug/${slug}`);
    return res && res.data ? res.data : res;
  }

  /**
   * Create new blog post (admin only)
   */
  async createPost(payload: CreateBlogRequest): Promise<BlogPost> {
    const res = await apiClient.post<any>('/blog', payload);
    return res && res.data ? res.data : res;
  }

  /**
   * Update blog post (admin only)
   */
  async updatePost(id: string, payload: Partial<CreateBlogRequest>): Promise<BlogPost> {
    const res = await apiClient.put<any>(`/blog/${id}`, payload);
    return res && res.data ? res.data : res;
  }

  /**
   * Delete blog post (admin only)
   */
  async deletePost(id: string): Promise<BlogPost> {
    const res = await apiClient.delete<any>(`/blog/${id}`);
    return res && res.data ? res.data : res;
  }
}

export const blogService = new BlogService();
