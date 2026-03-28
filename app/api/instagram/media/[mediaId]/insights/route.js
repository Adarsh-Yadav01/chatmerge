
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const requestId = crypto.randomUUID();
  const logPrefix = `[${new Date().toISOString()}] [${requestId}]`;
  const mediaId = params.mediaId;

  console.log(`${logPrefix} GET /api/instagram/media/${mediaId}/insights`);

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
    console.log(`${logPrefix} Raw session object:`, JSON.stringify(session, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2));

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
    console.log(`${logPrefix} Database user:`, JSON.stringify(user, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2));

    if (!user) {
      console.error(`${logPrefix} User not found in database`, { userId: id, instagramUserId });
      return NextResponse.json({ message: 'User not found in database', requestId }, { status: 403 });
    }

    const databaseInstagramUserId = user.instagramUserId ? user.instagramUserId.toString() : null;
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

    // Fetch media details to determine media_type
    console.log(`${logPrefix} Fetching media details for mediaId:`, mediaId);
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=media_type&access_token=${instagramToken}&locale=en_US`,
      { headers: { 'X-Request-ID': requestId, 'Accept-Language': 'en-US' } }
    );
    const mediaData = await mediaResponse.json();
    console.log(`${logPrefix} Media API response status:`, mediaResponse.status);
    if (!mediaResponse.ok) {
      console.error(`${logPrefix} Media API error:`, JSON.stringify(mediaData.error, null, 2));
      return NextResponse.json({ message: mediaData.error.message, details: mediaData.error, requestId }, { status: mediaResponse.status });
    }
    const mediaType = mediaData.media_type;
    console.log(`${logPrefix} Media type:`, mediaType);

    // Define metrics based on media_type
    const videoMetrics = 'reach,likes,comments,shares,saved,views,total_interactions,ig_reels_video_view_total_time,ig_reels_avg_watch_time';
    const defaultMetrics = 'reach,likes,comments,shares,saved,views,total_interactions,follows,profile_visits,profile_activity';
    const metrics = mediaType === 'VIDEO' ? videoMetrics : defaultMetrics;

    // Fetch media insights with locale=en_US
    console.log(`${logPrefix} Fetching Instagram media insights for mediaId:`, mediaId, `with metrics:`, metrics);
    const insightsResponse = await fetch(
      `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&period=lifetime&access_token=${instagramToken}&locale=en_US`,
      { headers: { 'X-Request-ID': requestId, 'Accept-Language': 'en-US' } }
    );
    const insightsData = await insightsResponse.json();
    console.log(`${logPrefix} Insights API response status:`, insightsResponse.status);
    if (!insightsResponse.ok) {
      console.error(`${logPrefix} Insights API error:`, JSON.stringify(insightsData.error, null, 2));
      return NextResponse.json({ message: insightsData.error.message, details: insightsData.error, requestId }, { status: insightsResponse.status });
    }
    console.log(`${logPrefix} Insights data:`, JSON.stringify(insightsData, null, 2));

    // Map insights to ensure English labels
    const insights = insightsData.data.map((insight) => ({
      name: insight.name,
      title: getInsightLabel(insight.name),
      description: getInsightDescription(insight.name),
      values: insight.values,
    }));

    console.log(`${logPrefix} Media insights request completed successfully`);
    return NextResponse.json({
      insights,
      mediaType,
      requestId,
    });
  } catch (error) {
    console.error(`${logPrefix} Media insights error:`, error.message, error.stack);
    return NextResponse.json({ message: 'Internal server error', details: error.message, requestId }, { status: 500 });
  } finally {
    console.log(`${logPrefix} Disconnecting Prisma client`);
    await prisma.$disconnect();
  }
}

function getInsightLabel(name) {
  const labels = {
    reach: 'Reach',
    likes: 'Likes',
    comments: 'Comments',
    shares: 'Shares',
    saved: 'Saves',
    views: 'Views',
    total_interactions: 'Total Interactions',
    ig_reels_video_view_total_time: 'Total Watch Time',
    ig_reels_avg_watch_time: 'Average Watch Time',
    follows: 'Follows',
    profile_visits: 'Profile Visits',
    profile_activity: 'Profile Activity',
  };
  return labels[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInsightDescription(name) {
  const descriptions = {
    reach: 'The number of unique accounts that saw this post.',
    likes: 'The total number of likes on this post.',
    comments: 'The total number of comments on this post.',
    shares: 'The total number of times this post was shared.',
    saved: 'The total number of times this post was saved.',
    views: 'The total number of views for this post.',
    total_interactions: 'The total number of likes, comments, shares, and saves.',
    ig_reels_video_view_total_time: 'The total time users spent watching this Reel (in milliseconds).',
    ig_reels_avg_watch_time: 'The average time users spent watching this Reel per view (in milliseconds).',
    follows: 'The number of new followers gained from this post.',
    profile_visits: 'The number of visits to your profile from this post.',
    profile_activity: 'The number of actions (e.g., clicks) taken on your profile from this post.',
  };
  return descriptions[name] || 'Performance metric for this post.';
}
