import { supabase } from './supabase';
import { captureError } from './monitoring';

interface TrackingOptions {
  thumbnailId: string;
  testId?: string;
  type: 'impression' | 'click';
}

export async function trackMetric({ thumbnailId, testId, type }: TrackingOptions) {
  try {
    const url = `/api/track?thumbnailId=${thumbnailId}&type=${type}${testId ? `&testId=${testId}` : ''}`;
    
    // Use sendBeacon for better reliability when page is unloading
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
      return;
    }

    // Fallback to fetch
    await fetch(url, { method: 'POST' });
  } catch (error) {
    captureError(error as Error, { thumbnailId, testId, type });
  }
}

export async function getThumbnailPerformance(thumbnailId: string) {
  try {
    const { data, error } = await supabase
      .from('thumbnails')
      .select('impressions, clicks, ctr')
      .eq('id', thumbnailId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error as Error, { thumbnailId });
    return null;
  }
}