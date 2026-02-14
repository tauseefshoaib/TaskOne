import { AxiosError } from 'axios';

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export function toApiRequestError(
  error: unknown,
  fallbackMessage: string,
): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.statusText || error.message || fallbackMessage;
    return new ApiRequestError(message, status);
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError(fallbackMessage);
}
