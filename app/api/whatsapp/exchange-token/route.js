import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('POST /api/whatsapp/exchange-token called');
  try {
    console.log('Parsing request body...');
    const { code } = await request.json();
    console.log('Exchange Token Request Body:', JSON.stringify({ code }, null, 2));

    // Validate input
    if (!code) {
      console.error('Invalid request payload:', { code });
      return NextResponse.json({ error: 'Missing or invalid code' }, { status: 400 });
    }

    // Validate environment variables
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    console.log('Environment variables:', {
      clientId,
      clientSecret: clientSecret ? '[REDACTED]' : undefined,
      apiVersion,
    });

    if (!clientId || !clientSecret) {
      console.error('Missing environment variables:', { clientId, clientSecret });
      return NextResponse.json({ error: 'Server configuration error: Missing client ID or secret' }, { status: 500 });
    }

    // Token exchange with retry logic
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;
    console.log('Token exchange URL:', tokenUrl);
    
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        console.log(`Attempting token exchange (attempt ${attempts + 1})`);
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
          }),
        });
        console.log('Graph API response status:', response.status);
        const data = await response.json();
        console.log('Graph API response data:', JSON.stringify(data, null, 2));

        if (data.error) {
          console.error('Graph API error:', JSON.stringify(data.error, null, 2));
          return NextResponse.json({ error: data.error.message, errorDetails: data.error }, { status: 400 });
        }

        console.log('Token exchange successful:', { access_token: data.access_token });
        return NextResponse.json({ access_token: data.access_token }, { status: 200 });
      } catch (error) {
        attempts++;
        console.error(`Token exchange failed (attempt ${attempts}):`, error.message, error.stack);
        if (attempts >= maxAttempts) {
          console.error('Token exchange failed after max attempts');
          return NextResponse.json({ error: `Token exchange failed after ${maxAttempts} attempts: ${error.message}` }, { status: 500 });
        }
        console.log('Retrying after 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Unexpected error in exchange-token:', error.message, error.stack);
    return NextResponse.json({ error: `Unexpected server error: ${error.message}` }, { status: 500 });
  }
}