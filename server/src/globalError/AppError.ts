// src/shared/errors/AppError.ts
// Base error class — all custom errors extend this
// isOperational = true means it's an expected, handled error
// isOperational = false means it's a programming bug — crash and restart

export class AppError extends Error {
  constructor(
    public readonly message:       string,
    public readonly statusCode:    number,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    // Restore prototype chain — required when extending built-in classes in TS
    Object.setPrototypeOf(this, new.target.prototype);
    // Capture stack trace — excludes constructor from stack
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 400 Bad Request ────────────────────────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

// ── 400 Validation ─────────────────────────────────────────────────────────────
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

// ── 401 Unauthorized ───────────────────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized — please login') {
    super(message, 401);
  }
}

// ── 403 Forbidden ──────────────────────────────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden — you do not have permission') {
    super(message, 403);
  }
}

// ── 404 Not Found ──────────────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// ── 409 Conflict ───────────────────────────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

// ── 422 Unprocessable Entity ───────────────────────────────────────────────────
export class UnprocessableError extends AppError {
  constructor(message: string = 'Unprocessable entity') {
    super(message, 422);
  }
}

// ── 429 Too Many Requests ──────────────────────────────────────────────────────
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests — please slow down') {
    super(message, 429);
  }
}

// ── 500 Internal Server Error ──────────────────────────────────────────────────
export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    // isOperational = false — this is a bug, not a user error
    super(message, 500, false);
  }
}

// ── 503 Service Unavailable ────────────────────────────────────────────────────
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503);
  }
}