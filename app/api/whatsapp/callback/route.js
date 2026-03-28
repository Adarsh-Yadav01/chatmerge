
import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('GET /api/whatsapp/callback called');
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    console.log('Callback parameters:', { code });

    if (!code) {
      console.error('No code parameter in callback');
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const redirectUri = process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT_URI;
    console.log('Forwarding code to /api/whatsapp/exchange-token:', { code, redirectUri });

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    });

    console.log('Exchange-token response status:', res.status);
    const data = await res.json();
    console.log('Exchange-token response data:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Exchange-token error:', JSON.stringify(data.errorDetails || data.error, null, 2));
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    console.log('Token exchange successful:', { access_token: data.access_token });
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/whatsapp/automation?access_token=${data.access_token}`);
  } catch (error) {
    console.error('Callback error:', error.message, error.stack);
    return NextResponse.json({ error: `Callback error: ${error.message}` }, { status: 500 });
  }
}
