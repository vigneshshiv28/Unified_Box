export class BadRequestError extends Error {
    public readonly statusCode = 400;
    
    constructor(message = "Bad request") {
      super(message);
      this.name = "BadRequestError";
    }
  }
  
export class UnauthorizedError extends Error {
    public readonly statusCode = 401;

    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}
  
export class ForbiddenError extends Error {
    public readonly statusCode = 403;
    
    constructor(message = "Access denied") {
      super(message);
      this.name = "ForbiddenError";
    }
}
  
export class NotFoundError extends Error {
    public readonly statusCode = 404;
    
    constructor(message = "Resource not found") {
      super(message);
      this.name = "NotFoundError";
    }
}
  
export class ConflictError extends Error {
    public readonly statusCode = 409;
    
    constructor(message = "Resource conflict") {
      super(message);
      this.name = "ConflictError";
    }
}
  
export class InternalServerError extends Error {
    public readonly statusCode = 500;
    
    constructor(message = "Internal server error") {
      super(message);
      this.name = "InternalServerError";
    }
}

export function isHttpError(error: unknown): error is 
  | BadRequestError 
  | UnauthorizedError 
  | ForbiddenError 
  | NotFoundError 
  | ConflictError 
  | InternalServerError {
  return (
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof ConflictError ||
    error instanceof InternalServerError
  );
}

export function getErrorStatusCode(error: unknown): number {
    if (isHttpError(error)) {
      return error.statusCode;
    }
    return 500;
}