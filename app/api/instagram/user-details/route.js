import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Fetch the user and their Instagram token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instagramToken: true },
    });

    if (!user || !user.instagramToken) {
      return NextResponse.json({ message: 'User or Instagram token not found' }, { status: 404 });
    }

    // Proxy the request to Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/v22.0/me?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.instagramToken}`,
        },
      }
    );

    console.log('Graph API response status:', response.status);
    console.log('Graph API response headers:', Object.fromEntries(response.headers.entries()));
    const data = await response.json();
    console.log('Graph API response data:', data);

    if (!response.ok) {
      const errorDetail = data.error || { message: 'Unknown error' };
      console.error('Graph API error:', {
        status: response.status,
        message: errorDetail.message,
        type: errorDetail.type,
        code: errorDetail.code,
        fbtrace_id: errorDetail.fbtrace_id,
      });
      return NextResponse.json({ message: errorDetail.message, details: errorDetail }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user-details API:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });
    return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}