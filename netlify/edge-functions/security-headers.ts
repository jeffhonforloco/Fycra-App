import { Context } from '@netlify/edge-functions';
import { getSecurityHeaders } from '../../src/lib/security';

export default async (request: Request, context: Context) => {
  const response = await context.next();
  const headers = response.headers;

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Cache control for static assets
  const url = new URL(request.url);
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$/)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}