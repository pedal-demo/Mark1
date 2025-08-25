import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  errorCode?: number;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorCode: undefined
  });

  const handleError = useCallback((error: string | Error, code?: number) => {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(`Error ${code || 404}: ${errorMessage}`);
    setErrorState({
      hasError: true,
      error: errorMessage,
      errorCode: code || 404
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorCode: undefined
    });
  }, []);

  const retry = useCallback(() => {
    clearError();
    // Trigger a page refresh or retry logic
    window.location.reload();
  }, [clearError]);

  const goHome = useCallback(() => {
    clearError();
    // Navigate to home page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' } }));
  }, [clearError]);

  return {
    hasError: errorState.hasError,
    error: errorState.error,
    errorCode: errorState.errorCode,
    handleError,
    clearError,
    retry,
    goHome
  };
};

export default useErrorHandler;
