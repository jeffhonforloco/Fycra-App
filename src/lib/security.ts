import { supabase } from './supabase';
import { captureError } from './monitoring';

export async function validateToken(token: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return !error && !!user;
  } catch (error) {
    captureError(error as Error);
    return false;
  }
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', // Increased to 2 years
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'bluetooth=()',
      'browsing-topics=()',
      'camera=()',
      'clipboard-read=()',
      'clipboard-write=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=()',
      'gamepad=()',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'idle-detection=()',
      'interest-cohort=()',
      'keyboard-map=()',
      'local-fonts=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'serial=()',
      'speaker-selection=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', '),
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': [
      "default-src 'self' https://*.supabase.co",
      "img-src 'self' data: https://*.unsplash.com https://*.supabase.co",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co https://*.stripe.com https://sentry.io",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
      "require-trusted-types-for 'script'",
      "trusted-types 'none'",
      "block-all-mixed-content",
      "manifest-src 'self'",
      "media-src 'none'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "font-src 'self'",
      "frame-src https://*.stripe.com",
      "sandbox allow-forms allow-scripts allow-same-origin allow-popups allow-downloads"
    ].join('; '),
    'NEL': '{"report_to":"default","max_age":31536000,"include_subdomains":true}',
    'Report-To': '{"group":"default","max_age":31536000,"endpoints":[{"url":"/api/security/reports"}],"include_subdomains":true}',
    'Clear-Site-Data': '"cache","cookies","storage"', // Only used for logout/security incidents
    'Feature-Policy': 'sync-xhr "none"',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-DNS-Prefetch-Control': 'off'
  };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\\/g, '') // Remove backslashes
    .replace(/&/g, '&amp;') // Encode ampersands
    .replace(/"/g, '&quot;') // Encode quotes
    .replace(/'/g, '&#x27;') // Encode single quotes
    .replace(/`/g, '&#x60;') // Encode backticks
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/\u001F/g, '') // Remove control characters
    .replace(/%00/g, '') // Remove null bytes in encoded form
    .replace(/\/\/+/g, '/') // Normalize multiple forward slashes
    .replace(/\\\\+/g, '\\') // Normalize multiple backslashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MIN_SIZE = 1024; // 1KB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const FORBIDDEN_PATTERNS = [
    /\.php$/i,
    /\.exe$/i,
    /\.dll$/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.aspx$/i,
    /\.html$/i,
    /\.htm$/i,
    /\.js$/i,
    /\.jar$/i
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (file.size < MIN_SIZE) {
    return { valid: false, error: 'File size must be at least 1KB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  const extension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  // Check for forbidden patterns in filename
  if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'Invalid file name' };
  }

  // Check for double extensions (e.g., image.php.jpg)
  if ((file.name.match(/\./g) || []).length > 1) {
    return { valid: false, error: 'Multiple extensions not allowed' };
  }

  return { valid: true };
}

export function validateEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
  
  // Additional checks
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false; // RFC 5321
  if (email.split('@')[0].length > 64) return false; // Local part length
  
  // Check for disposable email providers
  const disposableProviders = ['tempmail.com', 'throwaway.com'];
  const domain = email.split('@')[1].toLowerCase();
  if (disposableProviders.includes(domain)) return false;

  return true;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    return { valid: false, error: 'Password cannot contain repeating characters' };
  }

  if (/^(?:password|admin|user|root|123|abc)/i.test(password)) {
    return { valid: false, error: 'Password cannot start with common words or patterns' };
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', '123456', 'zxcvbn'];
  if (keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    return { valid: false, error: 'Password cannot contain keyboard patterns' };
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    return { valid: false, error: 'Password cannot contain sequential letters' };
  }

  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
    return { valid: false, error: 'Password cannot contain sequential numbers' };
  }

  // Check for date patterns
  if (/(?:19|20)\d{2}/.test(password)) {
    return { valid: false, error: 'Password cannot contain year patterns' };
  }

  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3 || username.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters' };
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(username)) {
    return { valid: false, error: 'Username must start with a letter and can only contain letters, numbers, underscores, and hyphens' };
  }

  // Check for reserved words
  const reservedWords = [
    'admin', 'administrator', 'root', 'system', 'moderator', 'support',
    'help', 'info', 'contact', 'abuse', 'security', 'postmaster', 'hostmaster',
    'webmaster', 'api', 'dev', 'test', 'demo', 'null', 'undefined', 'true',
    'false', 'super', 'sudo', 'sysadmin'
  ];

  if (reservedWords.some(word => username.toLowerCase().includes(word))) {
    return { valid: false, error: 'Username cannot contain reserved words' };
  }

  // Check for repeating characters
  if (/(.)\1{3,}/.test(username)) {
    return { valid: false, error: 'Username cannot contain more than 3 repeating characters' };
  }

  return { valid: true };
}

export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.tk', '.ml', '.ga', '.cf'];
    if (suspiciousTlds.some(tld => parsedUrl.hostname.endsWith(tld))) {
      return false;
    }

    // Check for IP addresses in hostname
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(parsedUrl.hostname)) {
      return false;
    }

    // Check for localhost and internal addresses
    if (
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname.includes('127.0.0.1') ||
      parsedUrl.hostname.includes('0.0.0.0') ||
      /^192\.168\./.test(parsedUrl.hostname) ||
      /^10\./.test(parsedUrl.hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(parsedUrl.hostname)
    ) {
      return false;
    }

    // Check URL length
    if (url.length > 2048) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function validateApiKey(apiKey: string): boolean {
  // Check length (typical API key length is 32-64 characters)
  if (apiKey.length < 32 || apiKey.length > 64) {
    return false;
  }

  // Should contain a mix of letters, numbers, and possibly some special characters
  if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
    return false;
  }

  // Should have good entropy (mix of character types)
  const hasUppercase = /[A-Z]/.test(apiKey);
  const hasLowercase = /[a-z]/.test(apiKey);
  const hasNumbers = /[0-9]/.test(apiKey);
  const hasSpecial = /[_-]/.test(apiKey);

  return (hasUppercase && hasLowercase && hasNumbers) || (hasNumbers && hasSpecial);
}