import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { supabase } from '../utils/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

export const setupAuthRoutes = (app) => {
  app.use('/auth', router);

  // Login validation
  const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ];

  // Register validation
  const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').trim().isLength({ min: 2 })
  ];

  // Login route
  router.post('/login', validate(loginValidation), async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      logger.info('User logged in', { userId: data.user.id });

      res.json(data);
    } catch (error) {
      logger.error('Login error', { error: error.message });
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
  });

  // Register route
  router.post('/register', validate(registerValidation), async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      logger.info('User registered', { userId: data.user.id });

      res.json(data);
    } catch (error) {
      logger.error('Registration error', { error: error.message });
      res.status(400).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  });

  // Password reset request
  router.post('/reset-password', 
    validate([body('email').isEmail().normalizeEmail()]),
    async (req, res) => {
      try {
        const { email } = req.body;

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;

        logger.info('Password reset requested', { email });

        res.json({ message: 'Password reset email sent' });
      } catch (error) {
        logger.error('Password reset error', { error: error.message });
        res.status(400).json({
          error: 'Password reset failed',
          message: error.message
        });
      }
    }
  );
};