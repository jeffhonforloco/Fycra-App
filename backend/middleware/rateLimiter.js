import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import ExpressBrute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import slowDown from 'express-slow-down';
import { logger } from '../utils/logger.js';

const redis = new Redis(process.env.REDIS_URL);

// General rate limiter
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:'
    }),
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: {
      error: 'Too many requests',
      message: 'Please try again later'
    },
    ...options
  });
};

// Brute force protection
const bruteStore = new BruteRedis({
  client: redis,
  prefix: 'brute-force:'
});

export const bruteForce = new ExpressBrute(bruteStore, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  failCallback: (req, res, next, nextValidRequestDate) => {
    logger.warn('Brute force attempt detected', {
      ip: req.ip,
      path: req.path,
      nextValidRequest: nextValidRequestDate
    });

    res.status(429).json({
      error: 'Too Many Attempts',
      message: 'Account locked. Please try again later',
      nextValidRequest: nextValidRequestDate
    });
  }
});

// Speed limiter
export const speedLimiter = slowDown({
  store: new RedisStore({
    client: redis,
    prefix: 'slow-down:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request
});

// Specific rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  }
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: 'Upload limit exceeded',
    message: 'Please try again later'
  }
});