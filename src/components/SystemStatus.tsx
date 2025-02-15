import React, { useEffect, useState } from 'react';
import { Activity, Server, Database, Globe, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { trackPerformanceMetrics } from '../lib/monitoring/performance';
import { checkHealth } from '../lib/health';
import toast from 'react-hot-toast';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  cdn: 'healthy' | 'degraded' | 'down';
  processing: 'healthy' | 'degraded' | 'down';
  lastUpdated: Date;
}

interface ServiceMetrics {
  latency: number;
  errorRate: number;
  uptime: number;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'healthy',
    database: 'healthy',
    cdn: 'healthy',
    processing: 'healthy',
    lastUpdated: new Date()
  });

  const [metrics, setMetrics] = useState<Record<string, ServiceMetrics>>({
    api: { latency: 0, errorRate: 0, uptime: 100 },
    database: { latency: 0, errorRate: 0, uptime: 100 },
    cdn: { latency: 0, errorRate: 0, uptime: 100 },
    processing: { latency: 0, errorRate: 0, uptime: 100 }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const [healthCheck, performanceMetrics] = await Promise.all([
          checkHealth(),
          trackPerformanceMetrics()
        ]);

        // Update status based on health check and metrics
        const newStatus: SystemStatus = {
          api: healthCheck.status === 'healthy' ? 'healthy' : 'degraded',
          database: healthCheck.database === 'connected' ? 'healthy' : 'down',
          cdn: performanceMetrics.requestLatency < 1000 ? 'healthy' : 'degraded',
          processing: performanceMetrics.cpu < 70 ? 'healthy' : 'degraded',
          lastUpdated: new Date()
        };

        setStatus(newStatus);

        // Update metrics
        setMetrics({
          api: {
            latency: performanceMetrics.requestLatency,
            errorRate: performanceMetrics.errorRate,
            uptime: 99.9 // Example value
          },
          database: {
            latency: 50, // Example value
            errorRate: 0.1,
            uptime: 99.99
          },
          cdn: {
            latency: 20,
            errorRate: 0.05,
            uptime: 99.95
          },
          processing: {
            latency: performanceMetrics.requestLatency,
            errorRate: performanceMetrics.errorRate,
            uptime: 99.8
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check system status');
        toast.error('Failed to check system status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
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
      case 'processing':
        return <Activity className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y">
      <div className="p-6">
        <h2 className="text-lg font-medium">System Status</h2>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {status.lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(status).map(([service, status]) => {
            if (service === 'lastUpdated') return null;
            const metrics = metrics[service];

            return (
              <div key={service} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service)}
                    <h3 className="font-medium capitalize">{service}</h3>
                  </div>
                  {getStatusIcon(status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Latency</span>
                    <span>{metrics.latency.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Error Rate</span>
                    <span>{metrics.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Uptime</span>
                    <span>{metrics.uptime.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}