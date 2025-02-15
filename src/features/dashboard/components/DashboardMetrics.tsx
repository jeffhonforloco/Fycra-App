import React from 'react';
import { DashboardMetrics as Metrics } from '../types';
import { TrendingUp, Eye, MousePointerClick, Target } from 'lucide-react';

interface DashboardMetricsProps {
  metrics: Metrics;
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Thumbnails"
        value={metrics.totalThumbnails}
        icon={Target}
        trend={10}
      />
      <MetricCard
        title="Total Impressions"
        value={metrics.totalImpressions}
        icon={Eye}
        trend={15}
      />
      <MetricCard
        title="Total Clicks"
        value={metrics.totalClicks}
        icon={MousePointerClick}
        trend={5}
      />
      <MetricCard
        title="Average CTR"
        value={`${metrics.averageCTR.toFixed(2)}%`}
        icon={TrendingUp}
        trend={-2}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
}

function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <Icon className="w-6 h-6 text-red-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last period</span>
      </div>
    </div>
  );
}