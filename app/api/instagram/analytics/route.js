import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET(req) {
  const requestId = crypto.randomUUID();
  const logPrefix = `[${new Date().toISOString()}] [${requestId}]`;

  console.log(`${logPrefix} GET /api/instagram/analytics`);

  try {
    // Log environment details
    console.log(`${logPrefix} Environment check:`, {
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Present' : 'Missing',
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      instagramClientId: process.env.INSTAGRAM_CLIENT_ID ? 'Present' : 'Missing',
      nodeEnv: process.env.NODE_ENV || 'Not set',
    });

    // Fetch session
    console.log(`${logPrefix} Fetching session with getServerSession`);
    const session = await getServerSession(authOptions);
    console.log(`${logPrefix} Raw session object:`, JSON.stringify(session, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

    // Validate session
    if (!session) {
      console.error(`${logPrefix} No session found`);
      return NextResponse.json({ message: 'No session found', requestId }, { status: 401 });
    }

    if (!session.user) {
      console.error(`${logPrefix} Session.user is missing`, { session });
      return NextResponse.json({ message: 'Session user data missing', requestId }, { status: 401 });
    }

    const { id, instagramUserId, instagramToken } = session.user;
    console.log(`${logPrefix} Session user fields:`, {
      id: { value: id, type: typeof id, isTruthy: !!id },
      instagramUserId: { value: instagramUserId, type: typeof instagramUserId, isTruthy: !!instagramUserId },
      instagramToken: { value: instagramToken ? '[Redacted]' : null, type: typeof instagramToken, isTruthy: !!instagramToken },
    });

    if (!id) {
      console.error(`${logPrefix} Session.user.id is missing or falsy`, { session });
      return NextResponse.json({ message: 'Session user ID missing or invalid', requestId }, { status: 401 });
    }

    if (!instagramUserId) {
      console.error(`${logPrefix} Session.user.instagramUserId is missing or falsy`, { session });
      return NextResponse.json({ message: 'Instagram account not linked (missing instagramUserId)', requestId }, { status: 401 });
    }

    if (!instagramToken) {
      console.error(`${logPrefix} Session.user.instagramToken is missing or falsy`, { session });
      return NextResponse.json({ message: 'Instagram account not linked (missing instagramToken)', requestId }, { status: 401 });
    }

    console.log(`${logPrefix} Session validated successfully`, { userId: id, instagramUserId });

    // Verify user in database
    console.log(`${logPrefix} Querying user in database for id:`, id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, instagramUserId: true, instagramToken: true },
    });
    console.log(`${logPrefix} Database user:`, JSON.stringify(user, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

    if (!user) {
      console.error(`${logPrefix} User not found in database`, { userId: id, instagramUserId });
      return NextResponse.json({ message: 'User not found in database', requestId }, { status: 403 });
    }

    const databaseInstagramUserId = user.instagramUserId?.toString();
    if (databaseInstagramUserId !== instagramUserId) {
      console.error(`${logPrefix} Instagram ID mismatch`, {
        userId: id,
        sessionInstagramUserId: instagramUserId,
        databaseInstagramUserId,
      });
      return NextResponse.json(
        {
          message: 'Instagram ID mismatch between session and database',
          details: { sessionInstagramUserId: instagramUserId, databaseInstagramUserId, requestId },
        },
        { status: 403 }
      );
    }

    console.log(`${logPrefix} Database user verified`, { userId: id, instagramUserId });

    // Get pagination cursor
    const { searchParams } = new URL(req.url);
    const after = searchParams.get('after') || '';
    console.log(`${logPrefix} Pagination cursor:`, { after });

    // Fetch profile data
    console.log(`${logPrefix} Fetching Instagram profile for userId:`, instagramUserId);
    const profileResponse = await fetch(
      `https://graph.instagram.com/v23.0/${instagramUserId}?fields=id,username,biography,followers_count,media_count,profile_picture_url&access_token=${instagramToken}`,
      { headers: { 'X-Request-ID': requestId } }
    );
    const profileData = await profileResponse.json();
    console.log(`${logPrefix} Profile API response status:`, profileResponse.status);
    if (!profileResponse.ok) {
      console.error(`${logPrefix} Profile API error:`, JSON.stringify(profileData.error, null, 2));
      return NextResponse.json({ message: profileData.error.message, details: profileData.error, requestId }, { status: profileResponse.status });
    }
    console.log(`${logPrefix} Profile data:`, JSON.stringify(profileData, null, 2));

    // Fetch media
    console.log(`${logPrefix} Fetching Instagram media for userId:`, instagramUserId);
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v23.0/${instagramUserId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,username,thumbnail_url&limit=10${after ? `&after=${after}` : ''}&access_token=${instagramToken}`,
      { headers: { 'X-Request-ID': requestId } }
    );
    const mediaData = await mediaResponse.json();
    console.log(`${logPrefix} Media API response status:`, mediaResponse.status);
    if (!mediaResponse.ok) {
      console.error(`${logPrefix} Media API error:`, JSON.stringify(mediaData.error, null, 2));
      return NextResponse.json({ message: mediaData.error.message, details: mediaData.error, requestId }, { status: mediaResponse.status });
    }
    console.log(`${logPrefix} Raw media data:`, JSON.stringify(mediaData.data, null, 2));

    console.log(`${logPrefix} Analytics request completed successfully`);
    return NextResponse.json({
      profile: profileData,
      media: mediaData.data,
      paging: mediaData.paging || {},
      requestId,
    });
  } catch (error) {
    console.error(`${logPrefix} Analytics error:`, error.message, error.stack);
    return NextResponse.json({ message: 'Internal server error', details: error.message, requestId }, { status: 500 });
  } finally {
    console.log(`${logPrefix} Disconnecting Prisma client`);
    await prisma.$disconnect();
  }
}