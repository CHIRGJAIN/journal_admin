/**
 * Review Service
 * Handles reviewer assignments and submissions
 */

import { apiClient } from '@/lib/apiClient';

export interface ReviewManuscript {
  id: string;
  title: string;
  status?: string;
  contentUrl?: string;
  updatedAt?: string;
  files?: Array<{ fileUrl?: string; url?: string }>;
}

export interface ReviewRecord {
  id: string;
  content?: string;
  decision?: string;
  createdAt?: string;
  manuscript: ReviewManuscript;
}

class ReviewService {
  async getMyReviews(): Promise<ReviewRecord[]> {
    const res = await apiClient.get<any>('/reviews/my');
    return res?.data ?? res ?? [];
  }

  async submitReview(
    reviewId: string,
    payload: { content: string; decision: string }
  ): Promise<ReviewRecord> {
    const res = await apiClient.patch<any>(`/reviews/${reviewId}/submit`, payload);
    return res?.data ?? res;
  }

  async assignReviewer(manuscriptId: string, reviewerId: string): Promise<any> {
    const res = await apiClient.post<any>('/reviews/assign', {
      manuscriptId,
      reviewerId,
    });
    return res?.data ?? res;
  }

  async getReviewsForManuscript(manuscriptId: string): Promise<ReviewRecord[]> {
    const res = await apiClient.get<any>(`/reviews/manuscript/${manuscriptId}`);
    return res?.data ?? res ?? [];
  }
}

export const reviewService = new ReviewService();
