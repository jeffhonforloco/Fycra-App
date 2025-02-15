import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FilterOptions, DashboardMetrics, TimeseriesData } from '../types';
import { handleError } from '@/lib/monitoring/errors';
import toast from 'react-hot-toast';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async (filters: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, timeseries] = await Promise.all([
        fetchMetrics(filters),
        fetchTimeseriesData(filters)
      ]);

      setMetrics(metricsData);
      setTimeseriesData(timeseries);
    } catch (err) {
      const errorDetails = handleError(err as Error);
      setError(errorDetails.userMessage);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (filters: FilterOptions): Promise<DashboardMetrics> => {
    const { data, error } = await supabase.rpc('get_dashboard_metrics', {
      p_timeframe: filters.timeframe
    });

    if (error) throw error;
    return data;
  };

  const fetchTimeseriesData = async (filters: FilterOptions): Promise<TimeseriesData[]> => {
    const { data, error } = await supabase.rpc('get_timeseries_data', {
      p_timeframe: filters.timeframe
    });

    if (error) throw error;
    return data;
  };

  return {
    metrics,
    timeseriesData,
    loading,
    error,
    loadDashboardData
  };
}