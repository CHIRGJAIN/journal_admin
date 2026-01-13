/**
 * [DOMAIN] Service Template
 * Copy this file and replace [DOMAIN] with your domain name (e.g., issue, review, etc.)
 * 
 * Usage:
 * 1. Copy this file: cp services/template.service.ts services/[domain].service.ts
 * 2. Replace [DOMAIN] with your actual domain name
 * 3. Define your types in types/[domain].types.ts
 * 4. Update services/index.ts to export the new service
 * 5. Use in components: import { [domain]Service } from '@/services';
 */

import { apiClient } from '@/lib/apiClient';
import type { YourEntityType } from '@/types/[domain].types';

/**
 * [DOMAIN] Service
 * Handles [domain]-related API calls
 */
class [Domain]Service {
  /**
   * Get all [domain] items
   */
  async getAll(params?: { page?: number; limit?: number }): Promise<YourEntityType[]> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const endpoint = query.toString() ? `/[domain]?${query.toString()}` : '/[domain]';
    return apiClient.get<YourEntityType[]>(endpoint);
  }

  /**
   * Get single [domain] item by ID
   */
  async getById(id: string): Promise<YourEntityType> {
    return apiClient.get<YourEntityType>(`/[domain]/${id}`);
  }

  /**
   * Create new [domain] item
   */
  async create(data: Partial<YourEntityType>): Promise<YourEntityType> {
    return apiClient.post<YourEntityType>('/[domain]', data);
  }

  /**
   * Update [domain] item
   */
  async update(id: string, data: Partial<YourEntityType>): Promise<YourEntityType> {
    return apiClient.put<YourEntityType>(`/[domain]/${id}`, data);
  }

  /**
   * Delete [domain] item
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/[domain]/${id}`);
  }

  // Add custom methods as needed
  // async customMethod(params: any): Promise<any> {
  //   return apiClient.post<any>('/[domain]/custom-endpoint', params);
  // }
}

export const [domain]Service = new [Domain]Service();
