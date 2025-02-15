// Application configuration
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
    endpoints: {
      health: '/health',
      thumbnails: '/thumbnails',
      abTests: '/ab-tests'
    }
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
};