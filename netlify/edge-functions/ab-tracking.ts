import { Context } from '@netlify/edge-functions';
import { createClient } from '@supabase/supabase-js';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const thumbnailId = url.searchParams.get('thumbnailId');
  const testId = url.searchParams.get('testId');
  const type = url.searchParams.get('type'); // 'impression' or 'click'

  if (!thumbnailId || !type) {
    return new Response('Missing parameters', { status: 400 });
  }

  const supabase = createClient(
    Netlify.env.get('SUPABASE_URL') || '',
    Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // Update thumbnail metrics
    await supabase.rpc('increment_thumbnail_metric', {
      p_thumbnail_id: thumbnailId,
      p_metric_type: type
    });

    // If part of an A/B test, update test metrics
    if (testId) {
      await supabase.rpc('increment_test_metric', {
        p_test_id: testId,
        p_thumbnail_id: thumbnailId,
        p_metric_type: type
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error tracking metrics', { status: 500 });
  }
}