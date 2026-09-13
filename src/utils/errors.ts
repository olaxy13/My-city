/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string, code = 'BAD_REQUEST', details?: unknown) {
    super(message, 400, code, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * 409 Conflict (e.g. duplicate key / slug)
 */
export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * 422 Unprocessable Entity (e.g. validation / invalid state transition)
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown, code = 'VALIDATION_ERROR') {
    super(message, 422, code, details);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(message: string, code = 'INVALID_STATE_TRANSITION') {
    super(message, 422, code);
  }
}
