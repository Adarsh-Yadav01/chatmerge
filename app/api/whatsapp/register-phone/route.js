import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('POST /api/whatsapp/register-phone called');
  try {
    const { phoneNumberId, accessToken, pin } = await request.json();
    console.log('Registering phone:', { phoneNumberId });
    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin,
      }),
    });
    const data = await response.json();
    console.log('Register response:', JSON.stringify(data, null, 2));
    if (data.error) {
      console.error('Phone registration error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error registering phone:', error.message, error.stack);
    return NextResponse.json({ error: `Failed to register phone: ${error.message}` }, { status: 500 });
  }
}