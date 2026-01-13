/**
 * Blog Service
 * Handles blog posts and articles
 */

import { apiClient } from '@/lib/apiClient';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  highlight?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  author: string;
  highlight?: string;
  published?: boolean;
}

class BlogService {
  /**
   * Get all published blog posts
   */
  async getAllPosts(page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[] }> {
    return apiClient.get<{ posts: BlogPost[] }>(`/blog?page=${page}&limit=${limit}`);
  }

  /**
   * Get single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    return apiClient.get<BlogPost>(`/blog/${slug}`);
  }

  /**
   * Create new blog post (admin only)
   */
  async createPost(payload: CreateBlogRequest): Promise<BlogPost> {
    return apiClient.post<BlogPost>('/blog', payload);
  }

  /**
   * Update blog post (admin only)
   */
  async updatePost(id: string, payload: Partial<CreateBlogRequest>): Promise<BlogPost> {
    return apiClient.put<BlogPost>(`/blog/${id}`, payload);
  }

  /**
   * Delete blog post (admin only)
   */
  async deletePost(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/blog/${id}`);
  }
}

export const blogService = new BlogService();
