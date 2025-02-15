import { describe, it, expect, vi } from 'vitest';
import { getDashboardMetrics, getTimeseriesData } from '../lib/monitoring/dashboard';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

describe('Dashboard Metrics', () => {
  it('should fetch dashboard metrics successfully', async () => {
    const mockMetrics = {
      totalThumbnails: 10,
      totalImpressions: 1000,
      totalClicks: 100,
      averageCTR: 10,
      activeTests: 2
    };

    vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockMetrics, error: null });

    const result = await getDashboardMetrics('test-user', '7d');
    expect(result).toEqual(mockMetrics);
  });

  it('should fetch timeseries data successfully', async () => {
    const mockData = [
      { date: '2025-02-15', impressions: 100, clicks: 10, ctr: 10 },
      { date: '2025-02-16', impressions: 200, clicks: 20, ctr: 10 }
    ];

    vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: mockData, error: null });

    const result = await getTimeseriesData('test-user', '7d');
    expect(result).toEqual(mockData);
  });
});