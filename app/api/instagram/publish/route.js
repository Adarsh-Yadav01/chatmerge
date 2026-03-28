import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Validate media file accessibility and basic compatibility
const validateMediaUrl = async (url, mediaType, requestId, timestamp) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      console.log(`[${timestamp}] [${requestId}] Media URL inaccessible: ${url}`);
      throw new Error(`Media URL inaccessible: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (mediaType === 'IMAGE' && !contentType.startsWith('image/')) {
      throw new Error('Invalid image format. Must be JPEG or PNG.');
    }
    if ((mediaType === 'VIDEO' || mediaType === 'REELS') && !contentType.includes('video/mp4')) {
      throw new Error('Invalid video format. Reels require MP4 with H.264 codec and AAC audio.');
    }
    return true;
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] Media validation failed: ${error.message}`);
    throw error;
  }
};

export async function POST(request) {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${requestId}] POST /api/instagram/publish`);

  try {
    // Environment check
    const envCheck = {
      instagramClientId: process.env.INSTAGRAM_CLIENT_ID ? 'Present' : 'Missing',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Present' : 'Missing',
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Missing',
    };
    console.log(`[${timestamp}] [${requestId}] Environment check:`, envCheck);

    if (!envCheck.instagramClientId || !envCheck.nextAuthSecret || !envCheck.nextPublicBaseUrl) {
      return NextResponse.json({ message: 'Missing environment variables' }, { status: 500 });
    }

    // Get session
    console.log(`[${timestamp}] [${requestId}] Fetching session with getServerSession`);
    const session = await getServerSession(authOptions);
    console.log(`[${timestamp}] [${requestId}] Raw session object:`, JSON.stringify(session, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    if (!session || !session.user || !session.user.id || !session.user.instagramUserId || !session.user.instagramToken) {
      console.log(`[${timestamp}] [${requestId}] Session user fields:`, {
        id: { value: session?.user?.id, type: typeof session?.user?.id, isTruthy: !!session?.user?.id },
        instagramUserId: { value: session?.user?.instagramUserId?.toString(), type: typeof session?.user?.instagramUserId, isTruthy: !!session?.user?.instagramUserId },
        instagramToken: { value: session?.user?.instagramToken ? '[Redacted]' : 'Missing', type: typeof session?.user?.instagramToken, isTruthy: !!session?.user?.instagramToken },
      });
      return NextResponse.json({ message: 'Unauthorized or missing Instagram credentials' }, { status: 401 });
    }

    console.log(`[${timestamp}] [${requestId}] Session user fields:`, {
      id: { value: session.user.id, type: typeof session.user.id, isTruthy: !!session.user.id },
      instagramUserId: { value: session.user.instagramUserId.toString(), type: typeof session.user.instagramUserId, isTruthy: !!session.user.instagramUserId },
      instagramToken: { value: '[Redacted]', type: typeof session.user.instagramToken, isTruthy: !!session.user.instagramToken },
    });

    // Verify user in database
    console.log(`[${timestamp}] [${requestId}] Querying user in database for id: ${session.user.id}`);
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, instagramUserId: true, instagramToken: true },
    });
    console.log(`[${timestamp}] [${requestId}] Database user:`, JSON.stringify(dbUser, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    if (!dbUser || dbUser.instagramUserId.toString() !== session.user.instagramUserId.toString() || dbUser.instagramToken !== session.user.instagramToken) {
      return NextResponse.json({ message: 'Invalid user or Instagram credentials in database' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    console.log(`[${timestamp}] [${requestId}] Request body:`, body);

    const { mediaType, mediaUrls, caption = '', altText, isCarousel = false } = body;

    if (!mediaType || !mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
      return NextResponse.json({ message: 'Missing or invalid mediaType or mediaUrls' }, { status: 400 });
    }

    if (isCarousel && mediaUrls.length > 10) {
      return NextResponse.json({ message: 'Carousel cannot exceed 10 items' }, { status: 400 });
    }

    if (!['IMAGE', 'VIDEO', 'REELS'].includes(mediaType)) {
      return NextResponse.json({ message: 'Invalid mediaType. Use IMAGE, VIDEO, or REELS' }, { status: 400 });
    }

    // Validate media URLs
    for (const [index, url] of mediaUrls.entries()) {
      await validateMediaUrl(url, mediaType, requestId, timestamp);
    }

    // Create media containers
    const containerIds = [];
    for (const [index, url] of mediaUrls.entries()) {
      console.log(`[${timestamp}] [${requestId}] Creating container for media ${index + 1}:`, {
        video_url: mediaType === 'IMAGE' ? undefined : url,
        image_url: mediaType === 'IMAGE' ? url : undefined,
        media_type: mediaType,
        caption: index === 0 ? caption : undefined,
        alt_text: mediaType === 'IMAGE' && index === 0 ? altText : undefined,
        is_carousel_item: isCarousel ? true : undefined,
        access_token: '[Redacted]',
      });

      const response = await fetch(`https://graph.instagram.com/v21.0/${session.user.instagramUserId}/media`, {
        method: 'POST',
        body: new URLSearchParams({
          media_type: mediaType,
          access_token: session.user.instagramToken,
          ...(mediaType === 'IMAGE' ? { image_url: url } : { video_url: url }),
          ...(index === 0 && caption ? { caption } : {}),
          ...(mediaType === 'IMAGE' && index === 0 && altText ? { alt_text: altText } : {}),
          ...(isCarousel ? { is_carousel_item: 'true' } : {}),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = await response.json();
      console.log(`[${timestamp}] [${requestId}] Container creation response:`, data);

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `Failed to create container for media ${index + 1}`);
      }

      const containerId = data.id;
      if (!containerId) {
        throw new Error(`No container ID returned for media ${index + 1}`);
      }

      // Poll container status for videos
      if (mediaType === 'VIDEO' || mediaType === 'REELS') {
        let status = 'IN_PROGRESS';
        const maxAttempts = 60; // 120s max wait
        let attempts = 0;
        const initialDelay = 2000; // Start with 2s
        const maxDelay = 5000; // Increase to 5s

        while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
          const delay = Math.min(initialDelay + attempts * 500, maxDelay); // Exponential backoff
          await sleep(delay);
          const statusResponse = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${session.user.instagramToken}`,
            { method: 'GET' }
          );
          const statusData = await statusResponse.json();
          console.log(`[${timestamp}] [${requestId}] Container ${containerId} status check (attempt ${attempts + 1}):`, statusData);

          if (!statusResponse.ok || statusData.error) {
            throw new Error(statusData.error?.message || `Failed to check container status for media ${index + 1}`);
          }

          status = statusData.status_code;
          attempts++;

          if (status === 'ERROR') {
            throw new Error(`Container processing failed for media ${index + 1}. Check media format, duration (3-90s), and accessibility.`);
          }
        }

        if (status !== 'FINISHED') {
          throw new Error(`Container for media ${index + 1} not ready after ${attempts * (initialDelay / 1000)} seconds`);
        }
      }

      containerIds.push(containerId);
    }

    // Publish media
    let publishId;
    if (isCarousel) {
      console.log(`[${timestamp}] [${requestId}] Creating carousel container with children:`, containerIds);
      const carouselResponse = await fetch(`https://graph.instagram.com/v21.0/${session.user.instagramUserId}/media`, {
        method: 'POST',
        body: new URLSearchParams({
          media_type: 'CAROUSEL',
          access_token: session.user.instagramToken,
          children: containerIds.join(','),
          caption,
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const carouselData = await carouselResponse.json();
      console.log(`[${timestamp}] [${requestId}] Carousel container creation response:`, carouselData);

      if (!carouselResponse.ok || carouselData.error) {
        throw new Error(carouselData.error?.message || 'Failed to create carousel container');
      }

      publishId = carouselData.id;
    } else {
      publishId = containerIds[0];
    }

    console.log(`[${timestamp}] [${requestId}] Publishing container with ID: ${publishId}`);
    const publishResponse = await fetch(`https://graph.instagram.com/v21.0/${session.user.instagramUserId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: publishId,
        access_token: session.user.instagramToken,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const publishData = await publishResponse.json();
    console.log(`[${timestamp}] [${requestId}] Publish response:`, publishData);

    if (!publishResponse.ok || publishData.error) {
      throw new Error(publishData.error?.message || 'Failed to publish media');
    }

    return NextResponse.json({ mediaId: publishData.id }, { status: 200 });
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] Publish failed:`, error);
    return NextResponse.json({ message: error.message, stack: error.stack }, { status: 500 });
  } finally {
    console.log(`[${timestamp}] [${requestId}] Disconnecting Prisma client`);
    await prisma.$disconnect();
  }
}