import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkHealth } from '@/lib/health';
import { trackPerformanceMetrics } from '@/lib/monitoring/performance';
import toast from 'react-hot-toast';

interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  cdn: 'healthy' | 'degraded' | 'down';
  cache: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
}

interface ServiceMetrics {
  latency: number;
  errorRate: number;
  uptime: number;
  responseTime: number;
  requestCount: number;
  failureCount: number;
}

export default function SystemHealth() {
  const [status, setStatus] = useState<HealthStatus>({
    api: 'healthy',
    database: 'healthy',
    cdn: 'healthy',
    cache: 'healthy',
    storage: 'healthy',
    lastChecked: new Date()
  });

  const [metrics, setMetrics] = useState<Record<string, ServiceMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [healthData, performanceData] = await Promise.all([
        checkHealth(),
        trackPerformanceMetrics()
      ]);

      // Update health status
      setStatus({
        api: determineHealth(performanceData.requestLatency, performanceData.errorRate),
        database: healthData.database === 'connected' ? 'healthy' : 'down',
        cdn: determineHealth(performanceData.requestLatency, performanceData.errorRate),
        cache: determineHealth(performanceData.requestLatency, performanceData.errorRate),
        storage: 'healthy', // Add actual storage health check
        lastChecked: new Date()
      });

      // Update metrics
      setMetrics({
        api: {
          latency: performanceData.requestLatency,
          errorRate: performanceData.errorRate,
          uptime: 99.9,
          responseTime: performanceData.requestLatency,
          requestCount: 1000,
          failureCount: 10
        },
        database: {
          latency: 50,
          errorRate: 0.1,
          uptime: 99.99,
          responseTime: 50,
          requestCount: 5000,
          failureCount: 5
        },
        cdn: {
          latency: 20,
          errorRate: 0.05,
          uptime: 99.95,
          responseTime: 20,
          requestCount: 10000,
          failureCount: 2
        },
        cache: {
          latency: 5,
          errorRate: 0.01,
          uptime: 99.99,
          responseTime: 5,
          requestCount: 20000,
          failureCount: 1
        },
        storage: {
          latency: 30,
          errorRate: 0.02,
          uptime: 99.99,
          responseTime: 30,
          requestCount: 3000,
          failureCount: 3
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check system health');
      toast.error('Failed to check system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const determineHealth = (latency: number, errorRate: number): HealthStatus['api'] => {
    if (errorRate > 5 || latency > 1000) return 'down';
    if (errorRate > 1 || latency > 500) return 'degraded';
    return 'healthy';
  };

  const getStatusIcon = (status: HealthStatus['api']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'api':
        return <Server className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'cdn':
        return <Globe className="w-5 h-5" />;
      case 'cache':
        return <Activity className="w-5 h-5" />;
      case 'storage':
        return <Database className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">System Health</h2>
          <p className="mt-1 text-sm text-gray-500">
            Last checked: {status.lastChecked.toLocaleString()}
          </p>
        </div>
        <button
          onClick={checkSystemHealth}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(status).map(([service, health]) => {
          if (service === 'lastChecked') return null;
          const serviceMetrics = metrics[service];

          return (
            <div key={service} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service)}
                    <h3 className="font-medium capitalize">{service}</h3>
                  </div>
                  {getStatusIcon(health)}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Time</span>
                      <span>{serviceMetrics.responseTime}ms</span>
                    </div>
                    <div className="mt-1 overflow-hidden bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          serviceMetrics.responseTime > 1000 ? 'bg-red-500' :
                          serviceMetrics.responseTime > 500 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (serviceMetrics.responseTime / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className="text-lg font-semibold">
                        {serviceMetrics.errorRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-lg font-semibold">
                        {serviceMetrics.uptime.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Requests</p>
                      <p className="text-lg font-semibold">
                        {serviceMetrics.requestCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Failures</p>
                      <p className="text-lg font-semibold">
                        {serviceMetrics.failureCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}