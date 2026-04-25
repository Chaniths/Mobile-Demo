export class AppError extends Error {
  public readonly status?: number;
  public readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'AppError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

export const toUserMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
