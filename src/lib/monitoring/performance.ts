import { captureError } from '../monitoring';

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requestLatency: number;
  errorRate: number;
  timestamp: string;
}

export async function trackPerformanceMetrics(): Promise<PerformanceMetrics> {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) throw new Error('Failed to fetch metrics');
    
    const metrics = await response.json();
    return metrics;
  } catch (error) {
    captureError(error as Error);
    throw error;
  }
}

export async function getPerformanceHistory(timeframe: '1h' | '24h' | '7d'): Promise<PerformanceMetrics[]> {
  try {
    const response = await fetch(`/api/metrics/history?timeframe=${timeframe}`);
    if (!response.ok) throw new Error('Failed to fetch metrics history');
    
    const history = await response.json();
    return history;
  } catch (error) {
    captureError(error as Error, { timeframe });
    throw error;
  }
}

export function calculateAverageLatency(metrics: PerformanceMetrics[]): number {
  if (!metrics.length) return 0;
  const sum = metrics.reduce((acc, curr) => acc + curr.requestLatency, 0);
  return sum / metrics.length;
}

export function calculateErrorRate(metrics: PerformanceMetrics[]): number {
  if (!metrics.length) return 0;
  const sum = metrics.reduce((acc, curr) => acc + curr.errorRate, 0);
  return sum / metrics.length;
}

export function isPerformanceDegraded(metrics: PerformanceMetrics): boolean {
  return (
    metrics.cpu > 70 ||
    metrics.memory > 80 ||
    metrics.requestLatency > 1000 ||
    metrics.errorRate > 5
  );
}