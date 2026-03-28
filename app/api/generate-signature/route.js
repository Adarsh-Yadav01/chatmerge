// app/api/generate-signature/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { body } = await req.json(); // Expect the JSON body from the frontend
    const secret = process.env.INSTAGRAM_APP_SECRET;

    if (!secret) {
      console.error('INSTAGRAM_APP_SECRET is undefined in .env');
      return NextResponse.json({ message: 'Configuration error: Missing APP_SECRET' }, { status: 500 });
    }

    const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const signature = `sha256=${hash}`;

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Signature generation error:', error.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}