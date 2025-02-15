import { Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { channel, message } = await request.json();

    // In a real implementation, you would integrate with email/Slack/webhook services
    console.log(`Alert sent via ${channel}: ${message}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to send alert' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}