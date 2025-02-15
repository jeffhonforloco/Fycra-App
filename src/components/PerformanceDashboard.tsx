import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getDashboardMetrics, getTimeseriesData, type PerformanceMetrics, type TimeseriesData } from '../lib/monitoring/dashboard';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerformanceDashboard({ userId }: { userId: string }) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [metricsData, timeseries] = await Promise.all([
          getDashboardMetrics(userId, timeframe),
          getTimeseriesData(userId, timeframe)
        ]);

        setMetrics(metricsData);
        setTimeseriesData(timeseries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, timeframe]);

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as '7d' | '30d')}
          className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Thumbnails"
            value={metrics.totalThumbnails}
          />
          <MetricCard
            title="Total Impressions"
            value={metrics.totalImpressions}
          />
          <MetricCard
            title="Total Clicks"
            value={metrics.totalClicks}
          />
          <MetricCard
            title="Average CTR"
            value={`${metrics.averageCTR.toFixed(2)}%`}
          />
        </div>
      )}

      {timeseriesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <Line
            data={{
              labels: timeseriesData.map(d => new Date(d.date).toLocaleDateString()),
              datasets: [
                {
                  label: 'CTR (%)',
                  data: timeseriesData.map(d => d.ctr),
                  borderColor: 'rgb(239, 68, 68)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Click-Through Rate Over Time'
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}