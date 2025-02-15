import React from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardFilters from './DashboardFilters';
import DashboardMetrics from './DashboardMetrics';
import DashboardChart from './DashboardChart';
import { useDashboard } from '../hooks/useDashboard';
import { FilterOptions } from '../types';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { metrics, timeseriesData, loading, error, loadDashboardData } = useDashboard();
  const [filters, setFilters] = React.useState<FilterOptions>({
    timeframe: '7days',
    sort: 'date',
    order: 'desc'
  });

  React.useEffect(() => {
    loadDashboardData(filters);
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <DashboardFilters
          filters={filters}
          onFilterChange={setFilters}
        />

        {metrics && <DashboardMetrics metrics={metrics} />}
        
        {timeseriesData.length > 0 && (
          <DashboardChart data={timeseriesData} />
        )}
      </main>
    </div>
  );
}