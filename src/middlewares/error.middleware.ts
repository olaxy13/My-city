import { Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { AppError, ValidationError } from '../utils/errors';
import { ApiErrorResponse } from '../models/common.dto';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  // Handle tsoa schema validation errors
  if (err instanceof ValidateError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.fields,
      },
    });
    return;
  }

  // Handle custom AppError hierarchy
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle invalid JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
    return;
  }

  // Generic errors
  if (err instanceof Error) {
    console.error(`[Unhandled Error] on ${req.method} ${req.path}:`, err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      },
    });
    return;
  }

  // Unknown error shape
  console.error(`[Unknown Error] on ${req.method} ${req.path}:`, err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
