import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] GET /api/media/comments-count`);

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id || !session.user.instagramUserId || !session.user.instagramToken) {
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId || typeof mediaId !== 'string' || !/^\d+$/.test(mediaId)) {
      return NextResponse.json({ message: 'Invalid or missing mediaId' }, { status: 400 });
    }

    // Check if media exists and belongs to user
    const existingMedia = await prisma.media.findUnique({
      where: { mediaId },
      include: {
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!existingMedia) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }

    if (existingMedia.igId.toString() !== session.user.instagramUserId) {
      return NextResponse.json({ message: 'Media not owned by user' }, { status: 403 });
    }

    return NextResponse.json({
      mediaId,
      commentCount: existingMedia._count.comments,
      hasComments: existingMedia._count.comments > 0
    }, { status: 200 });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] Comments count error:`, error.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}