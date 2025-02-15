import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, status')
      .eq('id', decoded.sub)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err.message
    });
  }
};