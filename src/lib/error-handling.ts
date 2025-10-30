// Next.js Error Handling Integration
// Integrates the logging system with Next.js error handling

import { NextRequest, NextResponse } from 'next/server';
import { logger, errorHandler, ApexError, asyncHandler } from './logging';

// Global error handler for Next.js App Router
export function handleGlobalError(error: Error, context: {
  pathname?: string;
  params?: any;
  searchParams?: any;
}) {
  // Log the error with context
  logger.error('Next.js Global Error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
    timestamp: new Date().toISOString(),
  });

  // Return appropriate error response
  if (error instanceof ApexError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle specific Next.js errors
  if (error.name === 'NextNotFoundError') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Page not found',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  // Generic error response
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

// API route wrapper with error handling
export function withErrorHandler(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return asyncHandler(async (req: NextRequest, context?: any) => {
    try {
      // Add request context to logger
      logger.addContext({
        requestId: crypto.randomUUID(),
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      });

      // Log request start
      logger.http('API Request Started', {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
      });

      const startTime = Date.now();
      
      // Execute the handler
      const response = await handler(req, context);
      
      // Log successful response
      const duration = Date.now() - startTime;
      logger.http('API Request Completed', {
        method: req.method,
        url: req.url,
        statusCode: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      // Error will be handled by asyncHandler and errorHandler
      throw error;
    }
  });
}

// Database operation wrapper
export function withDatabaseErrorHandling<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    operation()
      .then((result) => {
        const duration = Date.now() - startTime;
        logger.debug('Database Operation Success', {
          operation: operationName,
          duration: `${duration}ms`,
        });
        resolve(result);
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        logger.error('Database Operation Failed', {
          operation: operationName,
          error: error.message,
          duration: `${duration}ms`,
        });
        
        // Convert to ApexError if needed
        if (error instanceof ApexError) {
          reject(error);
        } else {
          reject(new ApexError(
            `Database operation failed: ${operationName}`,
            500,
            'DATABASE_ERROR',
            { originalError: error.message }
          ));
        }
      });
  });
}

// External API call wrapper
export async function withApiErrorHandling<T>(
  apiCall: () => Promise<T>,
  serviceName: string,
  method: string,
  url: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    
    logger.info('External API Success', {
      service: serviceName,
      method,
      url,
      duration: `${duration}ms`,
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('External API Failed', {
      service: serviceName,
      method,
      url,
      error: error.message,
      duration: `${duration}ms`,
      statusCode: error.response?.status,
    });
    
    // Convert to ApexError
    throw new ApexError(
      `External service error: ${serviceName}`,
      error.response?.status || 502,
      'EXTERNAL_SERVICE_ERROR',
      {
        service: serviceName,
        method,
        url,
        originalError: error.message,
        statusCode: error.response?.status,
      }
    );
  }
}

// Validation error helper
export function createValidationError(message: string, field?: string, value?: any): ValidationError {
  return new ValidationError(message, { field, value });
}

// Authentication error helper
export function createAuthenticationError(message: string = 'Authentication required'): AuthenticationError {
  return new AuthenticationError(message);
}

// Authorization error helper
export function createAuthorizationError(message: string = 'Insufficient permissions'): AuthorizationError {
  return new AuthorizationError(message);
}

// Not found error helper
export function createNotFoundError(resource: string = 'Resource'): NotFoundError {
  return new NotFoundError(`${resource} not found`);
}

// Conflict error helper
export function createConflictError(message: string, details?: any): ConflictError {
  return new ConflictError(message, details);
}

// Rate limiting error helper
export function createRateLimitError(resetTime?: Date): ApexError {
  return new ApexError(
    'Rate limit exceeded',
    429,
    'RATE_LIMIT_EXCEEDED',
    { resetTime: resetTime?.toISOString() }
  );
}

// Maintenance mode error helper
export function createMaintenanceError(): ApexError {
  return new ApexError(
    'Service is currently under maintenance',
    503,
    'MAINTENANCE_MODE'
  );
}

// Request validation helper
export function validateRequest(req: NextRequest, schema: any): void {
  try {
    // Add your validation logic here
    // This is a placeholder for integration with libraries like zod or joi
    const body = req.body;
    const query = Object.fromEntries(req.nextUrl.searchParams);
    
    // Validate body and query against schema
    // If validation fails, throw ValidationError
  } catch (error) {
    throw createValidationError('Invalid request data', error.field, error.value);
  }
}

// Response helper for consistent API responses
export class ApiResponse {
  static success<T>(data: T, message?: string, statusCode: number = 200): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  }

  static error(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any): NextResponse {
    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Health check helper
export function createHealthCheck(checks: Record<string, () => Promise<boolean>>) {
  return async () => {
    const results: Record<string, any> = {};
    let overallHealthy = true;

    for (const [name, check] of Object.entries(checks)) {
      try {
        const startTime = Date.now();
        const isHealthy = await check();
        const duration = Date.now() - startTime;
        
        results[name] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        };
        
        if (!isHealthy) {
          overallHealthy = false;
        }
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
        overallHealthy = false;
      }
    }

    const statusCode = overallHealthy ? 200 : 503;
    
    logger.healthCheck('application', overallHealthy ? 'healthy' : 'unhealthy', results);
    
    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: results,
    }, { status: statusCode });
  };
}

// Export all error handling utilities
export {
  logger,
  errorHandler,
  ApexError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  asyncHandler,
  requestLogger,
  performanceLogger,
  securityLogger,
  businessLogger,
  databaseLogger,
  apiLogger,
  healthLogger,
};