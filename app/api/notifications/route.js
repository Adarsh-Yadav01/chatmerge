import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// export async function GET(req) {
//   const requestId = crypto.randomUUID();
//   console.log(`[${new Date().toISOString()}] [${requestId}] [Request] GET request for notifications`);
  
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get('userId');
//   const isRead = searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined;

//   if (!userId) {
//     console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Missing userId`);
//     return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
//   }

//   try {
//     const where = { userId };
//     if (isRead !== undefined) {
//       where.isRead = isRead;
//     }

//     const notifications = await prisma.notification.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//       take: 50, // Limit to 50 notifications for performance
//     });

//     console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Fetched ${notifications.length} notifications for userId: ${userId}`);
//     return NextResponse.json(notifications, { status: 200 });
//   } catch (error) {
//     console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to fetch notifications: ${error.message}`);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET(req) {
  const requestId = crypto.randomUUID();
  

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const isRead = searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined;

  if (!userId) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Missing userId`);
    return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
  }

  try {
    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        actionType: true,
        message: true,
        actorUserId: true,
        actorUsername: true,
        actorProfilePicture: true,
        contentId: true,
        contentType: true,
        contentUrl: true,
        thumbnailUrl: true,
        contextText: true,
        contextSnippet: true,
        isRead: true,
        isClicked: true,
        clickedAt: true,
        priority: true,
        mediaType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch Instagram token for API calls
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instagramToken: true },
    });

    if (!user?.instagramToken) {
      console.warn(`[${new Date().toISOString()}] [${requestId}] [Warning] No Instagram token for userId: ${userId}`);
    }

    // Enhance notifications with postImage
    const enhancedNotifications = await Promise.all(notifications.map(async (notification) => {
      let postImage = notification.thumbnailUrl;
      if (!postImage && notification.contentId && notification.contentType === 'post' && user?.instagramToken) {
        try {
          const mediaData = await axios.get(`${INSTAGRAM_API}/${notification.contentId}?fields=thumbnail_url,media_url&access_token=${user.instagramToken}`, {
            timeout: 5000,
          });
          postImage = mediaData.data.thumbnail_url || mediaData.data.media_url || null;
          if (postImage) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: { thumbnailUrl: postImage, updatedAt: new Date() },
            });
            console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Updated notification ${notification.id} with thumbnailUrl: ${postImage}`);
          }
        } catch (error) {
          console.warn(`[${new Date().toISOString()}] [${requestId}] [Warning] Failed to fetch post image for contentId: ${notification.contentId}`, {
            error: error.message,
            apiError: error.response?.data?.error?.message,
          });
        }
      }
      return { ...notification, postImage };
    }));



    return NextResponse.json(enhancedNotifications, { status: 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to fetch notifications: ${error.message}`, { stack: error.stack });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] [Request] PATCH request to mark notification as read`);

  try {
    const { id, userId, isRead } = await req.json();

    if (!userId || !id || typeof isRead !== 'boolean') {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid input: userId, id, or isRead missing/invalid`);
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No notification found with id: ${id} for userId: ${userId}`);
      return NextResponse.json({ message: 'Notification not found or not authorized' }, { status: 404 });
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Marked notification as read for userId: ${userId}, notificationId: ${id}`);
    return NextResponse.json({ message: 'Notification updated', count: updated.count }, { status: 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to update notification: ${error.message}`);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] [Request] POST request to mark all notifications as read`);

  try {
    const { userId } = await req.json();

    if (!userId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid input: userId missing`);
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Marked ${updated.count} notifications as read for userId: ${userId}`);
    return NextResponse.json({ message: 'All notifications marked as read', count: updated.count }, { status: 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to update notifications: ${error.message}`);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}