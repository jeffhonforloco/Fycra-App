import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

export const setupThumbnailRoutes = (app) => {
  app.use('/thumbnails', router);

  // Create thumbnail
  router.post('/',
    auth,
    validate([
      body('title').trim().isLength({ min: 1 }),
      body('prompt').trim().isLength({ min: 1 }),
      body('style').isIn(['modern', 'dramatic', 'minimal', 'bold'])
    ]),
    async (req, res) => {
      try {
        const { title, prompt, style } = req.body;

        const { data, error } = await supabase
          .from('thumbnails')
          .insert({
            title,
            prompt,
            style,
            user_id: req.user.id,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        logger.info('Thumbnail created', { thumbnailId: data.id });

        res.json(data);
      } catch (error) {
        logger.error('Thumbnail creation error', { error: error.message });
        res.status(400).json({
          error: 'Failed to create thumbnail',
          message: error.message
        });
      }
    }
  );

  // Get user's thumbnails
  router.get('/', auth, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('thumbnails')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      logger.error('Thumbnails fetch error', { error: error.message });
      res.status(400).json({
        error: 'Failed to fetch thumbnails',
        message: error.message
      });
    }
  });

  // Get thumbnail by ID
  router.get('/:id', auth, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('thumbnails')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Thumbnail not found'
        });
      }

      res.json(data);
    } catch (error) {
      logger.error('Thumbnail fetch error', { error: error.message });
      res.status(400).json({
        error: 'Failed to fetch thumbnail',
        message: error.message
      });
    }
  });

  // Update thumbnail metrics
  router.post('/:id/metrics',
    auth,
    validate([
      body('type').isIn(['impression', 'click'])
    ]),
    async (req, res) => {
      try {
        const { type } = req.body;
        const field = type === 'impression' ? 'impressions' : 'clicks';

        const { data, error } = await supabase
          .from('thumbnails')
          .update({
            [field]: supabase.raw(`${field} + 1`)
          })
          .eq('id', req.params.id)
          .select()
          .single();

        if (error) throw error;

        logger.info('Thumbnail metrics updated', { 
          thumbnailId: req.params.id,
          type
        });

        res.json(data);
      } catch (error) {
        logger.error('Metrics update error', { error: error.message });
        res.status(400).json({
          error: 'Failed to update metrics',
          message: error.message
        });
      }
    }
  );
};