// ApexRebate Error Handling and Logging System
// Simplified version without winston dependency

import path from 'path';
import fs from 'fs';

// Simple logger interface
interface LogLevel {
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  http: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation
const createLogger = (): LogLevel => {
  const logToFile = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(logsDir, 'combined.log');
    
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
    }
  };
  
  return {
    error: (message: string, meta?: any) => logToFile('error', message, meta),
    warn: (message: string, meta?: any) => logToFile('warn', message, meta),
    info: (message: string, meta?: any) => logToFile('info', message, meta),
    http: (message: string, meta?: any) => logToFile('http', message, meta),
    debug: (message: string, meta?: any) => logToFile('debug', message, meta),
  };
};

// Create logger instance
const logger = createLogger();

// Custom error class
export class ApexError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public context?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', context?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends ApexError {
  constructor(message: string, context?: any) {
    super(message, 400, 'VALIDATION_ERROR', context);
  }
}

export class AuthenticationError extends ApexError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends ApexError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends ApexError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends ApexError {
  constructor(message: string, context?: any) {
    super(message, 409, 'CONFLICT_ERROR', context);
  }
}

export class DatabaseError extends ApexError {
  constructor(message: string, context?: any) {
    super(message, 500, 'DATABASE_ERROR', context);
  }
}

export class ExternalServiceError extends ApexError {
  constructor(message: string, service: string, context?: any) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service, ...context });
  }
}

// Error handler middleware
export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  let err = error;

  // Convert non-ApexError to ApexError
  if (!(error instanceof ApexError)) {
    const statusCode = 500;
    const message = error.message || 'Internal Server Error';
    err = new ApexError(message, statusCode, 'INTERNAL_ERROR');
  }

  const apexError = err as ApexError;

  // Log error
  logger.error('API Error', {
    error: {
      message: apexError.message,
      code: apexError.code,
      statusCode: apexError.statusCode,
      stack: apexError.stack,
      context: apexError.context,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    } : null,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    error: {
      code: apexError.code,
      message: isDevelopment ? apexError.message : 'Something went wrong',
      ...(isDevelopment && { stack: apexError.stack }),
      ...(isDevelopment && { context: apexError.context }),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(apexError.statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<void>) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
      } : null,
    };

    if (res.statusCode >= 400) {
      logger.http('HTTP Request Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

// Performance logger
export const performanceLogger = (name: string) => {
  const start = process.hrtime.bigint();
  
  return () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    logger.debug('Performance Metric', {
      name,
      duration: `${duration.toFixed(2)}ms`,
    });
    
    return duration;
  };
};

// Security event logger
export const securityLogger = (event: string, details: any) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
  });
};

// Business event logger
export const businessLogger = (event: string, userId: string, details: any) => {
  logger.info('Business Event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Database query logger
export const databaseLogger = (query: string, duration: number, params?: any) => {
  logger.debug('Database Query', {
    query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
    duration: `${duration}ms`,
    params: params ? JSON.stringify(params).substring(0, 100) : null,
  });
};

// External API call logger
export const apiLogger = (service: string, method: string, url: string, statusCode: number, duration: number) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  
  logger[level]('External API Call', {
    service,
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
  });
};

// Health check logger
export const healthLogger = (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
  const level = status === 'healthy' ? 'info' : 'error';
  
  logger[level]('Health Check', {
    service,
    status,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Log rotation and cleanup
export const cleanupLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const now = Date.now();
  
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      logger.error('Failed to read logs directory', { error: err.message });
      return;
    }
    
    files.forEach((file) => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error('Failed to get file stats', { file, error: err.message });
          return;
        }
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error('Failed to delete old log file', { file, error: err.message });
            } else {
              logger.info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
};

// Schedule log cleanup (run daily)
setInterval(cleanupLogs, 24 * 60 * 60 * 1000);

// Export logger instance
export { logger };

// Export default
export default logger;