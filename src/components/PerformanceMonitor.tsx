import React from 'react';
import { Line } from 'react-chartjs-2';
import { Loader2, AlertCircle, Activity, Cpu, Memory, Clock } from 'lucide-react';
import { trackPerformanceMetrics, getPerformanceHistory, type PerformanceMetrics } from '../lib/monitoring/performance';
import toast from 'react-hot-toast';

export default function PerformanceMonitor() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = React.useState<PerformanceMetrics[]>([]);
  const [timeframe, setTimeframe] = React.useState<'1h' | '24h' | '7d'>('1h');

  React.useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [current, history] = await Promise.all([
          trackPerformanceMetrics(),
          getPerformanceHistory(timeframe)
        ]);

        setCurrentMetrics(current);
        setMetricsHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        toast.error('Failed to load performance metrics');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
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
        <h2 className="text-lg font-medium text-gray-900">System Performance</h2>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="CPU Usage"
            value={`${currentMetrics.cpu.toFixed(1)}%`}
            icon={Cpu}
            status={currentMetrics.cpu > 70 ? 'warning' : 'normal'}
          />
          <MetricCard
            title="Memory Usage"
            value={`${currentMetrics.memory.toFixed(1)}%`}
            icon={Memory}
            status={currentMetrics.memory > 80 ? 'warning' : 'normal'}
          />
          <MetricCard
            title="Latency"
            value={`${currentMetrics.requestLatency.toFixed(0)}ms`}
            icon={Clock}
            status={currentMetrics.requestLatency > 1000 ? 'warning' : 'normal'}
          />
          <MetricCard
            title="Error Rate"
            value={`${currentMetrics.errorRate.toFixed(2)}%`}
            icon={Activity}
            status={currentMetrics.errorRate > 5 ? 'warning' : 'normal'}
          />
        </div>
      )}

      {metricsHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <Line
            data={{
              labels: metricsHistory.map(m => new Date(m.timestamp).toLocaleTimeString()),
              datasets: [
                {
                  label: 'CPU Usage (%)',
                  data: metricsHistory.map(m => m.cpu),
                  borderColor: 'rgb(239, 68, 68)',
                  tension: 0.4
                },
                {
                  label: 'Memory Usage (%)',
                  data: metricsHistory.map(m => m.memory),
                  borderColor: 'rgb(59, 130, 246)',
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
                  text: 'System Resource Usage Over Time'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  status: 'normal' | 'warning';
}

function MetricCard({ title, value, icon: Icon, status }: MetricCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${
      status === 'warning' ? 'border-2 border-red-500' : ''
    }`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${
          status === 'warning' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            status === 'warning' ? 'text-red-600' : 'text-gray-600'
          }`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${
            status === 'warning' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}