import { useState, useCallback } from 'react';

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// Extended loading state with data
export interface LoadingStateWithData<T> extends LoadingState {
  data: T | null;
}

// Hook for managing loading states
export function useLoadingState<T = unknown>(initialData: T | null = null) {
  const [state, setState] = useState<LoadingStateWithData<T>>({
    isLoading: false,
    error: null,
    isSuccess: false,
    data: initialData
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error,
      isSuccess: loading ? false : prev.isSuccess
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      isSuccess: false
    }));
  }, []);

  const setSuccess = useCallback((data?: T) => {
    setState(prev => ({
      ...prev,
      data: data !== undefined ? data : prev.data,
      isLoading: false,
      error: null,
      isSuccess: true
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
      data: initialData
    });
  }, [initialData]);

  const updateData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data
    }));
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
    updateData
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates<T extends Record<string, LoadingState>>(initialStates: T) {
  const [states, setStates] = useState<T>(initialStates);

  const setLoading = useCallback((key: keyof T, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: loading,
        error: loading ? null : prev[key].error,
        isSuccess: loading ? false : prev[key].isSuccess
      }
    }));
  }, []);

  const setError = useCallback((key: keyof T, error: string | null) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        isLoading: false,
        isSuccess: false
      }
    }));
  }, []);

  const setSuccess = useCallback((key: keyof T, data?: unknown) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        data: data !== undefined ? data : prev[key].data,
        isLoading: false,
        error: null,
        isSuccess: true
      }
    }));
  }, []);

  const reset = useCallback((key?: keyof T) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: {
          isLoading: false,
          error: null,
          isSuccess: false,
          data: initialStates[key].data
        }
      }));
    } else {
      setStates(initialStates);
    }
  }, [initialStates]);

  const updateData = useCallback((key: keyof T, data: unknown) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        data
      }
    }));
  }, []);

  return {
    states,
    setLoading,
    setError,
    setSuccess,
    reset,
    updateData
  };
}

// Utility function to create initial loading state
export function createInitialLoadingState<T>(initialData: T | null = null): LoadingStateWithData<T> {
  return {
    isLoading: false,
    error: null,
    isSuccess: false,
    data: initialData
  };
}

// Utility function to create multiple initial loading states
export function createMultipleInitialLoadingStates<T extends Record<string, LoadingState>>(
  states: T
): T {
  const result: Record<string, LoadingState> = {};
  
  Object.keys(states).forEach(key => {
    result[key] = createInitialLoadingState(states[key]);
  });
  
  return result;
}

// Async wrapper for API calls with loading state management
export async function withLoadingState<T>(
  loadingState: ReturnType<typeof useLoadingState>,
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    loadingState.setLoading(true);
    loadingState.setError(null);
    
    const result = await apiCall();
    
    loadingState.setSuccess(result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    loadingState.setError(errorMessage);
    return null;
  }
}

// Utility for managing form submission states
export function useFormSubmissionState() {
  const [state, setState] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: string | null,
    successMessage: string | null
  });

  const startSubmission = useCallback(() => {
    setState({
      isSubmitting: true,
      isSubmitted: false,
      error: null,
      successMessage: null
    });
  }, []);

  const setSubmissionError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isSubmitting: false,
      error
    }));
  }, []);

  const setSubmissionSuccess = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      isSubmitting: false,
      isSubmitted: true,
      successMessage: message,
      error: null
    }));
  }, []);

  const resetSubmission = useCallback(() => {
    setState({
      isSubmitting: false,
      isSubmitted: false,
      error: null,
      successMessage: null
    });
  }, []);

  return {
    ...state,
    startSubmission,
    setSubmissionError,
    setSubmissionSuccess,
    resetSubmission
  };
}

// Utility for managing pagination states
export function usePaginationState(initialPage: number = 1, initialLimit: number = 10) {
  const [state, setState] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updatePagination = useCallback((pagination: { total: number; pages: number }) => {
    setState(prev => ({
      ...prev,
      total: pagination.total,
      pages: pagination.pages
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setState({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      pages: 0
    });
  }, [initialPage, initialLimit]);

  return {
    ...state,
    setPage,
    setLimit,
    updatePagination,
    resetPagination
  };
}
