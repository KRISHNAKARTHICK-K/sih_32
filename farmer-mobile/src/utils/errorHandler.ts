import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/api';

export type ErrorType =
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNKNOWN';

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    type: ErrorType = 'UNKNOWN',
    statusCode?: number,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export const parseApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    // Network / Offline error (No response received)
    if (!error.response) {
      return new AppError(
        'Unable to connect to server. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }

    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse | undefined;

    const message = data?.message || error.message || 'An unexpected error occurred.';
    const fieldErrors = data?.fieldErrors;

    switch (status) {
      case 400:
        return new AppError(message, 'VALIDATION_ERROR', status, fieldErrors);
      case 401:
        return new AppError('Session expired. Please log in again.', 'UNAUTHORIZED', status);
      case 403:
        return new AppError('You do not have permission to perform this action.', 'FORBIDDEN', status);
      case 404:
        return new AppError(message || 'The requested resource was not found.', 'NOT_FOUND', status);
      case 409:
        return new AppError(message || 'A conflicting booking or slot was detected.', 'CONFLICT', status);
      case 500:
      case 502:
      case 503:
        return new AppError('Server error. Please try again later.', 'SERVER_ERROR', status);
      default:
        return new AppError(message, 'UNKNOWN', status);
    }
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN');
  }

  return new AppError('An unexpected error occurred.', 'UNKNOWN');
};
