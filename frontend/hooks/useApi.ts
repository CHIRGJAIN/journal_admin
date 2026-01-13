/**
 * Reusable hook for API calls with loading and error handling
 * Optional: Use for common patterns to reduce boilerplate
 */

import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>, options?: UseApiOptions) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        options?.onSuccess?.();
        return result;
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError('Unknown error');
        setState({ data: null, loading: false, error: apiError });
        options?.onError?.(apiError);
        throw apiError;
      }
    },
    []
  );

  return {
    ...state,
    execute,
  };
}
