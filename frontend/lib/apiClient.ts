/**
 * Centralized API Client with Caching & Retry Logic
 * Handles all HTTP requests with authentication, error handling, and performance optimizations
 */

import { apiBase } from './apiBase';

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiClient {
  private baseURL: string;
  private cache: Map<string, CacheEntry<unknown>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.baseURL = apiBase;
    this.cache = new Map();
  }

  /**
   * Get authorization token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Build headers with optional auth token
   */
  private getHeaders(headers?: Record<string, string>) {
    const token = this.getAuthToken();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    return defaultHeaders;
  }

  /**
   * Build headers for multipart/form-data (let browser set boundary)
   */
  private getHeadersForForm(headers?: Record<string, string>) {
    const token = this.getAuthToken();
    const defaultHeaders: Record<string, string> = {
      ...headers,
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    return defaultHeaders;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(cacheEntry: CacheEntry<unknown>): boolean {
    return Date.now() - cacheEntry.timestamp < this.CACHE_TTL;
  }

  /**
   * Get data from cache
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached)) {
      return cached.data as T;
    }
    // Clean up expired cache
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on 5xx errors and network errors
      return error.statusCode >= 500 || error.statusCode === 0;
    }
    return false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse JSON safely, even when the response is HTML or empty.
   */
  private async safeParse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  /**
   * Generic request method with caching and retry
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: unknown,
    headers?: Record<string, string>,
    useCache: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${method}:${url}`;

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
        // Add timeout and keepalive for better performance
        signal: AbortSignal.timeout(30000), // 30 second timeout
        keepalive: true,
      });

      // Parse response safely
      const data = await this.safeParse(response);

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.message || `API Error: ${response.status}`,
          response.status,
          data
        );
      }

      // Cache successful GET requests
      if (method === 'GET' && useCache) {
        this.setCachedData(cacheKey, data);
      }

      return data;
    };

    try {
      return await this.retryRequest(makeRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * GET request with caching
   */
  async get<T>(endpoint: string, useCache: boolean = true, options?: { withCredentials?: boolean }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: options?.withCredentials ? 'include' : 'same-origin',
        signal: AbortSignal.timeout(30000),
        keepalive: true,
      });
      const data = await this.safeParse(response);
      if (!response.ok) {
        throw new ApiError(
          data.message || `API Error: ${response.status}`,
          response.status,
          data
        );
      }
      return data;
    };
    try {
      return await this.retryRequest(makeRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, 'POST', body);
  }

  /**
   * POST multipart/form-data (FormData body)
   */
  async postForm<T>(endpoint: string, formData: FormData, options?: { withCredentials?: boolean }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeadersForForm(),
        body: formData,
        signal: AbortSignal.timeout(30000),
        keepalive: true,
        credentials: options?.withCredentials ? 'include' : 'same-origin',
      });

      const data = await this.safeParse(response);

      if (!response.ok) {
        throw new ApiError(
          data.message || `API Error: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    };

    try {
      return await this.retryRequest(makeRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public data?: unknown;

  constructor(message: string, statusCode: number = 500, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const apiClient = new ApiClient();
