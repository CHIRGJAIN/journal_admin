/**
 * Contact Message Service
 * Handles contact form submissions and inbox retrieval
 */

import { apiClient } from '@/lib/apiClient';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessageListResponse {
  status?: boolean;
  data: ContactMessage[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

class ContactService {
  async createMessage(payload: {
    name: string;
    email: string;
    message: string;
    source?: string;
  }): Promise<ContactMessage> {
    const res = await apiClient.post<any>('/contact-messages', payload);
    return res && res.data ? res.data : res;
  }

  async getMessages(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<ContactMessageListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) query.append('isRead', params.isRead.toString());
    const endpoint = query.toString() ? `/contact-messages?${query.toString()}` : '/contact-messages';
    const res = await apiClient.get<any>(endpoint);
    return {
      status: res?.status,
      data: res?.data ?? [],
      meta: res?.meta,
    };
  }
}

export const contactService = new ContactService();
