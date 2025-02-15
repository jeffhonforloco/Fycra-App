import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Admin role check middleware
const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
};

export const setupAdminRoutes = (app) => {
  app.use('/admin', auth, isAdmin, router);

  // Get system metrics
  router.get('/metrics', async (req, res) => {
    try {
      const { data, error } = await supabase.rpc('get_system_metrics');
      if (error) throw error;

      res.json(data);
    } catch (error) {
      logger.error('Metrics fetch error', { error: error.message });
      res.status(400).json({
        error: 'Failed to fetch metrics',
        message: error.message
      });
    }
  });

  // Get audit logs
  router.get('/audit-logs', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      logger.error('Audit logs fetch error', { error: error.message });
      res.status(400).json({
        error: 'Failed to fetch audit logs',
        message: error.message
      });
    }
  });

  // Update system settings
  router.put('/settings',
    validate([
      body('settings').isArray(),
      body('settings.*.key').isString(),
      body('settings.*.value').exists()
    ]),
    async (req, res) => {
      try {
        const { settings } = req.body;

        const { error } = await supabase
          .from('system_settings')
          .upsert(settings.map(s => ({
            ...s,
            updated_by: req.user.id,
            updated_at: new Date()
          })));

        if (error) throw error;

        logger.info('System settings updated', { 
          userId: req.user.id,
          count: settings.length
        });

        res.json({ message: 'Settings updated successfully' });
      } catch (error) {
        logger.error('Settings update error', { error: error.message });
        res.status(400).json({
          error: 'Failed to update settings',
          message: error.message
        });
      }
    }
  );

  // Get system health
  router.get('/health', async (req, res) => {
    try {
      const [dbHealth, storageHealth] = await Promise.all([
        supabase.rpc('check_database_health'),
        supabase.rpc('check_storage_health')
      ]);

      res.json({
        database: dbHealth.data,
        storage: storageHealth.data,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Health check error', { error: error.message });
      res.status(500).json({
        error: 'Health check failed',
        message: error.message
      });
    }
  });
};