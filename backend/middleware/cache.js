import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

export const cache = (duration = 300) => { // Default 5 minutes
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redis.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data))
          .catch(err => logger.error('Redis cache error:', err));
        
        return originalJson.call(this, data);
      };

      next();
    } catch (err) {
      logger.error('Cache middleware error:', err);
      next();
    }
  };
};