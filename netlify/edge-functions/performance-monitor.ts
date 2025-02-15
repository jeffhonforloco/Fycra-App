import { Context } from '@netlify/edge-functions';

interface SystemMetrics {
  cpu: number;
  memory: number;
  requestLatency: number;
  errorRate: number;
  timestamp: string;
}

export default async (request: Request, context: Context) => {
  try {
    // Simulate gathering system metrics
    // In a real implementation, these would come from actual system monitoring
    const metrics: SystemMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      requestLatency: Math.random() * 2000,
      errorRate: Math.random() * 10,
      timestamp: new Date().toISOString()
    };

    // Store metrics in Netlify's edge cache
    const cacheKey = `metrics:${new Date().toISOString()}`;
    await context.store.set(cacheKey, metrics, 86400); // Store for 24 hours

    return new Response(JSON.stringify(metrics), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to gather metrics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}