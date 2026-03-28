import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('POST /api/whatsapp/subscribe-webhooks called');
  try {
    const { wabaId, accessToken } = await request.json();
    console.log('Subscribing to WABA:', { wabaId });
    const response = await fetch(`https://graph.facebook.com/v23.0/${wabaId}/subscribed_apps`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Subscribe response:', JSON.stringify(data, null, 2));
    if (data.error) {
      console.error('Webhook subscription error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error subscribing to webhooks:', error.message, error.stack);
    return NextResponse.json({ error: `Failed to subscribe to webhooks: ${error.message}` }, { status: 500 });
  }
}