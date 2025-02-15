import { supabase } from '../supabase';
import { captureError } from '../monitoring';

export interface PerformanceMetrics {
  totalThumbnails: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  activeTests: number;
}

export interface TimeseriesData {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export async function getDashboardMetrics(userId: string, timeframe: '7d' | '30d' | 'all' = '7d'): Promise<PerformanceMetrics> {
  try {
    const timeFilter = timeframe === 'all' ? '' : 
      `created_at >= now() - interval '${timeframe === '7d' ? '7 days' : '30 days'}'`;

    const { data, error } = await supabase
      .rpc('get_user_metrics', {
        p_user_id: userId,
        p_time_filter: timeFilter
      });

    if (error) throw error;

    return data;
  } catch (error) {
    captureError(error as Error, { userId, timeframe });
    throw error;
  }
}

export async function getTimeseriesData(userId: string, timeframe: '7d' | '30d'): Promise<TimeseriesData[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_timeseries_data', {
        p_user_id: userId,
        p_days: timeframe === '7d' ? 7 : 30
      });

    if (error) throw error;

    return data;
  } catch (error) {
    captureError(error as Error, { userId, timeframe });
    throw error;
  }
}