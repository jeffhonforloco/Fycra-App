import { Thumbnail } from '@/lib/database.types';

export interface DashboardMetrics {
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

export interface FilterOptions {
  timeframe: 'all' | '7days' | '30days';
  status?: 'pending' | 'completed' | 'failed';
  sort?: 'date' | 'impressions' | 'clicks' | 'ctr';
  order?: 'asc' | 'desc';
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  thumbnails: Thumbnail[];
  timeseriesData: TimeseriesData[];
  filters: FilterOptions;
  loading: boolean;
  error: string | null;
}