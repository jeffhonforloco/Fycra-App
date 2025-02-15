import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Server, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface DatabaseMetrics {
  connections: number;
  queryCount: number;
  cacheHitRatio: number;
  avgResponseTime: number;
  diskUsage: number;
  memoryUsage: number;
}

interface TimeseriesData {
  timestamp: string;
  queryCount: number;
  responseTime: number;
}

export default function DatabaseMonitor() {
  const [currentMetrics, setCurrentMetrics] = useState<DatabaseMetrics | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, these would be actual database metrics
      const metrics: DatabaseMetrics = {
        connections: 42,
        queryCount: 1567,
        cacheHitRatio: 87.5,
        avgResponseTime: 145,
        diskUsage: 68.3,
        memoryUsage: 72.1
      };

      const timeseries: TimeseriesData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        queryCount: Math.floor(Math.random() * 1000) + 500,
        responseTime: Math.floor(Math.random() * 200) + 100
      })).reverse();

      setCurrentMetrics(metrics);
      setTimeseriesData(timeseries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database metrics');
      toast.error('Failed to load database metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Database Metrics</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
          className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {currentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Connections</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.connections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Queries/Second</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.queryCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Server className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cache Hit Ratio</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.cacheHitRatio}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.avgResponseTime}ms</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <HardDrive className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disk Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.diskUsage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Server className="w-6 h-6 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Memory Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{currentMetrics.memoryUsage}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {timeseriesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <Line
            data={{
              labels: timeseriesData.map(d => new Date(d.timestamp).toLocaleTimeString()),
              datasets: [
                {
                  label: 'Query Count',
                  data: timeseriesData.map(d => d.queryCount),
                  borderColor: 'rgb(239, 68, 68)',
                  tension: 0.4,
                  yAxisID: 'y'
                },
                {
                  label: 'Response Time (ms)',
                  data: timeseriesData.map(d => d.responseTime),
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.4,
                  yAxisID: 'y1'
                }
              ]
            }}
            options={{
              responsive: true,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Database Performance'
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Query Count'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Response Time (ms)'
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}