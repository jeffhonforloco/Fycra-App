import { Router } from 'express';
import { setupAuthRoutes } from './auth.js';
import { setupUserRoutes } from './users.js';
import { setupThumbnailRoutes } from './thumbnails.js';
import { setupAdminRoutes } from './admin.js';

export const setupRoutes = (app) => {
  const router = Router();

  // Setup route groups
  setupAuthRoutes(router);
  setupUserRoutes(router);
  setupThumbnailRoutes(router);
  setupAdminRoutes(router);

  // Mount all routes under /api
  app.use('/api', router);
};