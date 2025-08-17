// API Error Handler Utility
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class ApiErrorHandler {
  static handleError(error: unknown): ApiError {
    // Handle different types of errors
    if (error instanceof Error) {
      // Network or fetch errors
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        return {
          message: 'Network connection error. Please check your internet connection and try again.',
          code: 'NETWORK_ERROR'
        };
      }

      // API response errors
      if (error.message.includes('HTTP error')) {
        const statusMatch = error.message.match(/status: (\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : undefined;
        
        return this.getErrorMessageByStatus(status, error.message);
      }

      // Generic error
      return {
        message: error.message || 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR'
      };
    }

    // Handle non-Error objects
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR'
      };
    }

    if (error && typeof error === 'object') {
      // Handle API response error objects
      if (error.error) {
        return {
          message: error.error,
          status: error.status,
          code: error.code,
          details: error.details
        };
      }

      // Handle other object errors
      const errorObj = error as { message?: string; status?: number; code?: string };
      return {
        message: errorObj.message || 'An unexpected error occurred.',
        status: errorObj.status,
        code: errorObj.code,
        details: error
      };
    }

    return {
      message: 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR'
    };
  }

  private static getErrorMessageByStatus(status: number | undefined): ApiError {
    if (!status) {
      return {
        message: 'An error occurred while processing your request.',
        code: 'HTTP_ERROR'
      };
    }

    switch (status) {
      case 400:
        return {
          message: 'Invalid request. Please check your input and try again.',
          status,
          code: 'BAD_REQUEST'
        };
      
      case 401:
        return {
          message: 'Authentication required. Please log in to continue.',
          status,
          code: 'UNAUTHORIZED'
        };
      
      case 403:
        return {
          message: 'Access denied. You do not have permission to perform this action.',
          status,
          code: 'FORBIDDEN'
        };
      
      case 404:
        return {
          message: 'The requested resource was not found.',
          status,
          code: 'NOT_FOUND'
        };
      
      case 409:
        return {
          message: 'Conflict detected. The resource already exists or cannot be created.',
          status,
          code: 'CONFLICT'
        };
      
      case 422:
        return {
          message: 'Validation error. Please check your input and try again.',
          status,
          code: 'VALIDATION_ERROR'
        };
      
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          status,
          code: 'RATE_LIMIT_EXCEEDED'
        };
      
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          status,
          code: 'INTERNAL_SERVER_ERROR'
        };
      
      case 502:
        return {
          message: 'Bad gateway. The server is temporarily unavailable.',
          status,
          code: 'BAD_GATEWAY'
        };
      
      case 503:
        return {
          message: 'Service unavailable. Please try again later.',
          status,
          code: 'SERVICE_UNAVAILABLE'
        };
      
      case 504:
        return {
          message: 'Gateway timeout. The request took too long to complete.',
          status,
          code: 'GATEWAY_TIMEOUT'
        };
      
      default:
        return {
          message: `An error occurred (${status}). Please try again.`,
          status,
          code: 'HTTP_ERROR'
        };
    }
  }

  static isNetworkError(error: ApiError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: ApiError): boolean {
    return error.status === 401 || error.status === 403;
  }

  static isValidationError(error: ApiError): boolean {
    return error.status === 400 || error.status === 422;
  }

  static isServerError(error: ApiError): boolean {
    return error.status && error.status >= 500;
  }

  static isClientError(error: ApiError): boolean {
    return error.status && error.status >= 400 && error.status < 500;
  }

  static getRetryableErrors(): string[] {
    return ['NETWORK_ERROR', 'INTERNAL_SERVER_ERROR', 'BAD_GATEWAY', 'SERVICE_UNAVAILABLE', 'GATEWAY_TIMEOUT'];
  }

  static shouldRetry(error: ApiError): boolean {
    return this.getRetryableErrors().includes(error.code || '');
  }

  static getErrorMessage(error: ApiError): string {
    return error.message || 'An unexpected error occurred.';
  }

  static getErrorDetails(error: ApiError): unknown {
    return error.details || null;
  }

  static logError(error: ApiError, context?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'API',
      error: {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', logData);
    }

    // In production, you might want to send this to a logging service
    // Example: logToService(logData);
  }
}

// Convenience function for quick error handling
export const handleApiError = (error: unknown, context?: string): ApiError => {
  const apiError = ApiErrorHandler.handleError(error);
  ApiErrorHandler.logError(apiError, context);
  return apiError;
};

// Error message constants for common scenarios
export const ERROR_MESSAGES = {
  NETWORK: 'Network connection error. Please check your internet connection and try again.',
  AUTH_REQUIRED: 'Authentication required. Please log in to continue.',
  ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.'
} as const;
