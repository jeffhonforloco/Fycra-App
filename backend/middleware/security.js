import helmet from 'helmet';
import { randomBytes } from 'crypto';
import { logger } from '../utils/logger.js';

// Generate a new nonce for CSP
const generateNonce = () => {
  return randomBytes(16).toString('base64');
};

// Enhanced security middleware
export const security = [
  // Basic security headers
  helmet(),

  // Custom CSP with nonce
  (req, res, next) => {
    const nonce = generateNonce();
    req.nonce = nonce;

    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          "'strict-dynamic'",
          'https:'
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        reportUri: '/api/security/csp-report'
      }
    })(req, res, next);
  },

  // Prevent clickjacking
  helmet.frameguard({ action: 'deny' }),

  // Strict transport security
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }),

  // Prevent MIME type sniffing
  helmet.noSniff(),

  // XSS protection
  helmet.xssFilter(),

  // Hide powered by header
  helmet.hidePoweredBy(),

  // Referrer policy
  helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),

  // Permissions policy
  (req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    next();
  },

  // Security headers reporting
  (req, res, next) => {
    res.on('finish', () => {
      const securityHeaders = {
        'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
        'Strict-Transport-Security': res.getHeader('Strict-Transport-Security'),
        'X-Frame-Options': res.getHeader('X-Frame-Options'),
        'X-Content-Type-Options': res.getHeader('X-Content-Type-Options'),
        'X-XSS-Protection': res.getHeader('X-XSS-Protection'),
        'Referrer-Policy': res.getHeader('Referrer-Policy'),
        'Permissions-Policy': res.getHeader('Permissions-Policy')
      };

      logger.debug('Security headers set:', securityHeaders);
    });
    next();
  }
];