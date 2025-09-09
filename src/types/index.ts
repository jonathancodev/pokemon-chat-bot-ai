// Export all types from their respective modules
export * from './pokemon';
export * from './chat';
export * from './ui';
export * from './api';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Generic error type
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
}
