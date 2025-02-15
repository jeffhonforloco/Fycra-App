import { supabase } from './supabase';

export async function checkHealth() {
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('thumbnails')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}