import { captureError, captureMessage } from '../monitoring';

export interface ErrorDetails {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  userMessage: string;
  action: string;
}

export const ErrorCodes: Record<string, ErrorDetails> = {
  // Authentication Errors
  'AUTH001': {
    code: 'AUTH001',
    message: 'Invalid credentials',
    severity: 'error',
    userMessage: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.'
  },
  'AUTH002': {
    code: 'AUTH002',
    message: 'Session expired',
    severity: 'warning',
    userMessage: 'Your session has expired.',
    action: 'Please sign in again to continue.'
  },
  'AUTH003': {
    code: 'AUTH003',
    message: 'Account locked',
    severity: 'error',
    userMessage: 'Your account has been locked for security reasons.',
    action: 'Please contact support to unlock your account.'
  },

  // Rate Limiting Errors
  'RATE001': {
    code: 'RATE001',
    message: 'API rate limit exceeded',
    severity: 'warning',
    userMessage: 'You\'ve reached your API request limit.',
    action: 'Please wait before making more requests or upgrade your plan.'
  },
  'RATE002': {
    code: 'RATE002',
    message: 'Concurrent requests limit',
    severity: 'warning',
    userMessage: 'Too many simultaneous requests.',
    action: 'Please reduce the number of concurrent requests.'
  },

  // Thumbnail Generation Errors
  'GEN001': {
    code: 'GEN001',
    message: 'Invalid image format',
    severity: 'error',
    userMessage: 'The image format is not supported.',
    action: 'Please use JPG, PNG, or WebP images only.'
  },
  'GEN002': {
    code: 'GEN002',
    message: 'Image too large',
    severity: 'error',
    userMessage: 'The image file is too large.',
    action: 'Please use an image smaller than 5MB.'
  },
  'GEN003': {
    code: 'GEN003',
    message: 'Processing failed',
    severity: 'error',
    userMessage: 'Failed to generate thumbnail.',
    action: 'Please try again or contact support if the issue persists.'
  },

  // Subscription Errors
  'SUB001': {
    code: 'SUB001',
    message: 'Payment failed',
    severity: 'error',
    userMessage: 'Your payment could not be processed.',
    action: 'Please check your payment method and try again.'
  },
  'SUB002': {
    code: 'SUB002',
    message: 'Usage limit exceeded',
    severity: 'warning',
    userMessage: 'You\'ve reached your plan\'s usage limit.',
    action: 'Please upgrade your plan to continue.'
  },

  // Performance Errors
  'PERF001': {
    code: 'PERF001',
    message: 'High latency detected',
    severity: 'warning',
    userMessage: 'The service is experiencing delays.',
    action: 'Please try again later.'
  },
  'PERF002': {
    code: 'PERF002',
    message: 'Service degradation',
    severity: 'warning',
    userMessage: 'The service is running slower than usual.',
    action: 'We\'re working on improving performance.'
  }
};

export function handleError(error: Error | string, context?: Record<string, any>): ErrorDetails {
  const errorCode = extractErrorCode(error);
  const errorDetails = ErrorCodes[errorCode] || {
    code: 'UNKNOWN',
    message: typeof error === 'string' ? error : error.message,
    severity: 'error',
    userMessage: 'An unexpected error occurred.',
    action: 'Please try again or contact support.'
  };

  captureError(typeof error === 'string' ? new Error(error) : error, {
    ...context,
    errorCode: errorDetails.code
  });

  return errorDetails;
}

function extractErrorCode(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  const codeMatch = message.match(/\b([A-Z]{3,4}\d{3})\b/);
  return codeMatch ? codeMatch[1] : 'UNKNOWN';
}

export function isRetryableError(error: Error | string): boolean {
  const errorDetails = handleError(error);
  return [
    'RATE001',
    'RATE002',
    'PERF001',
    'PERF002'
  ].includes(errorDetails.code);
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff with jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 1000; // Random delay between 0-1000ms
  return exponentialDelay + jitter;
}