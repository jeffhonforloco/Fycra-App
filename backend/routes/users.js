import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

export const setupUserRoutes = (app) => {
  app.use('/users', router);

  // Get user profile
  router.get('/profile', auth, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      logger.error('Profile fetch error', { error: error.message });
      res.status(400).json({
        error: 'Failed to fetch profile',
        message: error.message
      });
    }
  });

  // Update user profile
  router.put('/profile', 
    auth,
    validate([
      body('fullName').optional().trim().isLength({ min: 2 }),
      body('preferences').optional().isObject()
    ]),
    async (req, res) => {
      try {
        const { fullName, preferences } = req.body;

        const { data, error } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            preferences,
            updated_at: new Date()
          })
          .eq('id', req.user.id)
          .select()
          .single();

        if (error) throw error;

        logger.info('Profile updated', { userId: req.user.id });

        res.json(data);
      } catch (error) {
        logger.error('Profile update error', { error: error.message });
        res.status(400).json({
          error: 'Failed to update profile',
          message: error.message
        });
      }
    }
  );
};