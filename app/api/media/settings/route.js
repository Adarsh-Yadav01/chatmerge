import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] POST /api/media/settings`);

  try {
    const session = await getServerSession(authOptions);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session data:`, JSON.stringify(session, null, 2));

    if (!session || !session.user.id || !session.user.instagramUserId || !session.user.instagramToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Unauthorized or Instagram account not linked`, { session });
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }

    const {
      mediaId,
      dmMessage,
      dmLink,
      openingDmMessage,
      dmLinkButtonLabel,
      postbackButtonLabel,
      keywords,
      commentReplies,
      caption,
      mediaType,
      mediaUrl,
      permalink,
      timestamp,
    } = await req.json();
    console.log(`[${new Date().toISOString()}] [${requestId}] Request body:`, {
      mediaId,
      dmMessage,
      dmLink,
      openingDmMessage,
      dmLinkButtonLabel,
      postbackButtonLabel,
      keywords,
      commentReplies,
      caption,
      mediaType,
      mediaUrl,
      permalink,
      timestamp,
    });

    // Validate mediaId
    if (!mediaId || typeof mediaId !== 'string' || !/^\d+$/.test(mediaId)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid mediaId format`, { mediaId });
      return NextResponse.json({ message: 'Invalid mediaId format' }, { status: 400 });
    }

    // Validate request body types
    if (
      (dmMessage && typeof dmMessage !== 'string') ||
      (dmLink && typeof dmLink !== 'string') ||
      (openingDmMessage && typeof dmMessage !== 'string') ||
      (dmLinkButtonLabel && typeof dmLinkButtonLabel !== 'string') ||
      (postbackButtonLabel && typeof postbackButtonLabel !== 'string') ||
      (keywords && (!Array.isArray(keywords) || !keywords.every(k => typeof k === 'string'))) ||
      (commentReplies && (!Array.isArray(commentReplies) || !commentReplies.every(r => typeof r === 'string'))) ||
      (caption && typeof caption !== 'string') ||
      (mediaType && typeof mediaType !== 'string') ||
      (mediaUrl && typeof mediaUrl !== 'string') ||
      (permalink && typeof permalink !== 'string') ||
      (timestamp && typeof timestamp !== 'string')
    ) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid request body`);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Validate character limits
    if (dmMessage && dmMessage.length > 640) {
      console.error(`[${new Date().toISOString()}] [${requestId}] dmMessage exceeds 640 characters`, { length: dmMessage.length });
      return NextResponse.json({ message: 'DM message must be 640 characters or less' }, { status: 400 });
    }
    if (openingDmMessage && openingDmMessage.length > 640) {
      console.error(`[${new Date().toISOString()}] [${requestId}] openingDmMessage exceeds 640 characters`, { length: openingDmMessage.length });
      return NextResponse.json({ message: 'Opening DM message must be 640 characters or less' }, { status: 400 });
    }
    if (dmLinkButtonLabel && dmLinkButtonLabel.length > 20) {
      console.error(`[${new Date().toISOString()}] [${requestId}] dmLinkButtonLabel exceeds 20 characters`, { length: dmLinkButtonLabel.length });
      return NextResponse.json({ message: 'DM link button label must be 20 characters or less' }, { status: 400 });
    }
    if (postbackButtonLabel && postbackButtonLabel.length > 20) {
      console.error(`[${new Date().toISOString()}] [${requestId}] postbackButtonLabel exceeds 20 characters`, { length: postbackButtonLabel.length });
      return NextResponse.json({ message: 'Postback button label must be 20 characters or less' }, { status: 400 });
    }

    // Validate URLs
    const validateUrl = (url, fieldName) => {
      try {
        new URL(url);
      } catch {
        console.error(`[${new Date().toISOString()}] [${requestId}] Invalid ${fieldName} URL`, { [fieldName]: url });
        throw new Error(`Invalid ${fieldName} URL`);
      }
    };
    if (dmLink) validateUrl(dmLink, 'dmLink');
    if (mediaUrl) validateUrl(mediaUrl, 'mediaUrl');
    if (permalink) validateUrl(permalink, 'permalink');

    // Validate mediaType
    if (mediaType && !['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(mediaType)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid mediaType`, { mediaType });
      return NextResponse.json({ message: 'Invalid media type. Must be IMAGE, VIDEO, or CAROUSEL_ALBUM' }, { status: 400 });
    }

    // Validate timestamp
    let parsedTimestamp = null;
    if (timestamp) {
      try {
        parsedTimestamp = new Date(timestamp);
        if (isNaN(parsedTimestamp.getTime())) {
          throw new Error('Invalid timestamp');
        }
      } catch {
        console.error(`[${new Date().toISOString()}] [${requestId}] Invalid timestamp format`, { timestamp });
        return NextResponse.json({ message: 'Invalid timestamp format' }, { status: 400 });
      }
    }

    // Verify user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, instagramUserId: true },
    });
    if (!user || user.instagramUserId?.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] User not found or Instagram ID mismatch`, {
        id: session.user.id,
        instagramUserId: session.user.instagramUserId,
      });
      return NextResponse.json({ message: 'User not found or Instagram ID mismatch' }, { status: 403 });
    }

    // Check if media exists and belongs to the user
    const existingMedia = await prisma.media.findUnique({
      where: { mediaId },
      select: { igId: true },
    });
    if (existingMedia && existingMedia.igId.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Media not owned by user`, {
        mediaId,
        igId: existingMedia.igId.toString(),
        instagramUserId: session.user.instagramUserId,
      });
      return NextResponse.json({ message: 'Media not owned by user' }, { status: 403 });
    }

    // Update or create media record
    const mediaRecord = await prisma.media.upsert({
      where: {
        mediaId,
      },
      update: {
        dmMessage: dmMessage || null,
        dmLink: dmLink || null,
        openingDmMessage: openingDmMessage || null,
        dmLinkButtonLabel: dmLinkButtonLabel || null,
        postbackButtonLabel: postbackButtonLabel || null,
        keywords: keywords || ['link'],
        commentReplies: commentReplies || ['Hey! Check your DM'],
        caption: caption || null,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        permalink: permalink || null,
        timestamp: parsedTimestamp || null,
        updatedAt: new Date(),
      },
      create: {
        mediaId,
        igId: BigInt(session.user.instagramUserId),
        userId: user.id,
        dmMessage: dmMessage || null,
        dmLink: dmLink || null,
        openingDmMessage: openingDmMessage || null,
        dmLinkButtonLabel: dmLinkButtonLabel || null,
        postbackButtonLabel: postbackButtonLabel || null,
        keywords: keywords || ['link'],
        commentReplies: commentReplies || ['Hey! Check your DM'],
        caption: caption || null,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        permalink: permalink || null,
        timestamp: parsedTimestamp || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        mediaId: true,
        igId: true,
        userId: true,
        dmMessage: true,
        dmLink: true,
        openingDmMessage: true,
        dmLinkButtonLabel: true,
        postbackButtonLabel: true,
        keywords: true,
        commentReplies: true,
        caption: true,
        mediaType: true,
        mediaUrl: true,
        permalink: true,
        timestamp: true,
      },
    });

    console.log(`[${new Date().toISOString()}] [${requestId}] DM settings and media saved successfully`, {
      mediaId,
      savedFields: {
        mediaType,
        mediaUrl,
        caption,
        permalink,
        timestamp: parsedTimestamp?.toISOString(),
        postbackButtonLabel,
      },
    });

    // Convert BigInt and timestamp for JSON serialization, and map fields to Instagram API style
    const serializedMediaRecord = {
      ...mediaRecord,
      igId: mediaRecord.igId.toString(),
      media_url: mediaRecord.mediaUrl,
      media_type: mediaRecord.mediaType,
      timestamp: mediaRecord.timestamp ? mediaRecord.timestamp.toISOString() : null,
      postbackButtonLabel: mediaRecord.postbackButtonLabel,
    };

    return NextResponse.json(
      {
        message: 'DM settings and media saved successfully',
        media: serializedMediaRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] Media settings error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Unique constraint violation`, { mediaId });
      return NextResponse.json({ message: 'Media ID already exists' }, { status: 409 });
    }
    if (error.message.includes('Invalid URL') || error.message.includes('Invalid timestamp')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] GET /api/media/settings`);

  try {
    const session = await getServerSession(authOptions);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session data:`, JSON.stringify(session, null, 2));

    if (!session || !session.user.id || !session.user.instagramUserId || !session.user.instagramToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Unauthorized or Instagram account not linked`, { session });
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }

    // Get mediaId from query parameters (optional)
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');

    // Validate mediaId if provided
    if (mediaId && (typeof mediaId !== 'string' || !/^\d+$/.test(mediaId))) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid mediaId format`, { mediaId });
      return NextResponse.json({ message: 'Invalid mediaId format' }, { status: 400 });
    }

    // Verify user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, instagramUserId: true },
    });
    if (!user || user.instagramUserId?.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] User not found or Instagram ID mismatch`, {
        id: session.user.id,
        instagramUserId: session.user.instagramUserId,
      });
      return NextResponse.json({ message: 'User not found or Instagram ID mismatch' }, { status: 403 });
    }

    if (mediaId) {
      // Find specific media record
      const mediaRecord = await prisma.media.findUnique({
        where: { mediaId },
        select: {
          id: true,
          mediaId: true,
          igId: true,
          userId: true,
          dmMessage: true,
          dmLink: true,
          openingDmMessage: true,
          dmLinkButtonLabel: true,
          postbackButtonLabel: true,
          keywords: true,
          commentReplies: true,
          caption: true,
          mediaType: true,
          mediaUrl: true,
          permalink: true,
          timestamp: true,
        },
      });

      if (!mediaRecord) {
        console.error(`[${new Date().toISOString()}] [${requestId}] Media not found`, { mediaId });
        return NextResponse.json({ message: 'Media not found' }, { status: 404 });
      }

      // Check if media belongs to the user
      if (mediaRecord.igId.toString() !== session.user.instagramUserId) {
        console.error(`[${new Date().toISOString()}] [${requestId}] Media not owned by user`, {
          mediaId,
          igId: mediaRecord.igId.toString(),
          instagramUserId: session.user.instagramUserId,
        });
        return NextResponse.json({ message: 'Media not owned by user' }, { status: 403 });
      }

      console.log(`[${new Date().toISOString()}] [${requestId}] Media settings retrieved successfully`, {
        mediaId,
        retrievedFields: {
          mediaType: mediaRecord.mediaType,
          mediaUrl: mediaRecord.mediaUrl,
          caption: mediaRecord.caption,
          permalink: mediaRecord.permalink,
          timestamp: mediaRecord.timestamp?.toISOString(),
          postbackButtonLabel: mediaRecord.postbackButtonLabel,
        },
      });

      // Convert BigInt and timestamp for JSON serialization, and map fields to Instagram API style
      const serializedMediaRecord = {
        ...mediaRecord,
        igId: mediaRecord.igId.toString(),
        media_url: mediaRecord.mediaUrl,
        media_type: mediaRecord.mediaType,
        timestamp: mediaRecord.timestamp ? mediaRecord.timestamp.toISOString() : null,
        postbackButtonLabel: mediaRecord.postbackButtonLabel,
      };

      return NextResponse.json(
        {
          message: 'Media settings retrieved successfully',
          media: serializedMediaRecord,
        },
        { status: 200 }
      );
    } else {
      // Find all media records for the user
      const mediaRecords = await prisma.media.findMany({
        where: { 
          igId: BigInt(session.user.instagramUserId)
        },
        select: {
          id: true,
          mediaId: true,
          igId: true,
          userId: true,
          dmMessage: true,
          dmLink: true,
          openingDmMessage: true,
          dmLinkButtonLabel: true,
          postbackButtonLabel: true,
          keywords: true,
          commentReplies: true,
          caption: true,
          mediaType: true,
          mediaUrl: true,
          permalink: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'desc' // Order by newest first
        }
      });

      console.log(`[${new Date().toISOString()}] [${requestId}] All media settings retrieved successfully`, {
        count: mediaRecords.length,
        instagramUserId: session.user.instagramUserId,
      });

      // Convert BigInt and timestamp for JSON serialization, and map fields to Instagram API style
      const serializedMediaRecords = mediaRecords.map(record => ({
        ...record,
        igId: record.igId.toString(),
        media_url: record.mediaUrl,
        media_type: record.mediaType,
        timestamp: record.timestamp ? record.timestamp.toISOString() : null,
        postbackButtonLabel: record.postbackButtonLabel,
      }));

      return NextResponse.json(
        {
          message: 'All media settings retrieved successfully',
          media: serializedMediaRecords,
          count: serializedMediaRecords.length,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] Media settings retrieval error:`, error.message, error.stack);
    return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] PUT /api/media/settings`);

  try {
    const session = await getServerSession(authOptions);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session data:`, JSON.stringify(session, null, 2));

    if (!session || !session.user.id || !session.user.instagramUserId || !session.user.instagramToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Unauthorized or Instagram account not linked`, { session });
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }

    // Get mediaId from query parameters
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');

    // Validate mediaId
    if (!mediaId || typeof mediaId !== 'string' || !/^\d+$/.test(mediaId)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid or missing mediaId`, { mediaId });
      return NextResponse.json({ message: 'Invalid or missing mediaId' }, { status: 400 });
    }

    // Verify user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, instagramUserId: true },
    });
    if (!user || user.instagramUserId?.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] User not found or Instagram ID mismatch`, {
        id: session.user.id,
        instagramUserId: session.user.instagramUserId,
      });
      return NextResponse.json({ message: 'User not found or Instagram ID mismatch' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const {
      postbackButtonLabel,
      dmMessage,
      openingDmMessage,
      dmLink,
      dmLinkButtonLabel,
      keywords,
      commentReplies
    } = body;

    // Validate required fields
    if (!postbackButtonLabel || typeof postbackButtonLabel !== 'string' || postbackButtonLabel.trim() === '') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Missing or invalid postbackButtonLabel`, { postbackButtonLabel });
      return NextResponse.json({ message: 'Button label is required' }, { status: 400 });
    }

    // Validate arrays
    if (keywords && !Array.isArray(keywords)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid keywords format`, { keywords });
      return NextResponse.json({ message: 'Keywords must be an array' }, { status: 400 });
    }

    if (commentReplies && !Array.isArray(commentReplies)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Invalid commentReplies format`, { commentReplies });
      return NextResponse.json({ message: 'Comment replies must be an array' }, { status: 400 });
    }

    // Validate URL if provided
    if (dmLink && dmLink.trim() !== '') {
      try {
        new URL(dmLink);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [${requestId}] Invalid URL format`, { dmLink });
        return NextResponse.json({ message: 'Invalid URL format for DM link' }, { status: 400 });
      }
    }

    // Check if media exists and belongs to user
    const existingMedia = await prisma.media.findUnique({
      where: { mediaId },
      select: { id: true, igId: true, mediaId: true }
    });

    if (!existingMedia) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Media not found`, { mediaId });
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }

    if (existingMedia.igId.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Media not owned by user`, {
        mediaId,
        igId: existingMedia.igId.toString(),
        instagramUserId: session.user.instagramUserId,
      });
      return NextResponse.json({ message: 'Media not owned by user' }, { status: 403 });
    }

    // Update media settings
    const updatedMedia = await prisma.media.update({
      where: { mediaId },
      data: {
        postbackButtonLabel: postbackButtonLabel.trim(),
        dmMessage: dmMessage?.trim() || null,
        openingDmMessage: openingDmMessage?.trim() || null,
        dmLink: dmLink?.trim() || null,
        dmLinkButtonLabel: dmLinkButtonLabel?.trim() || null,
        keywords: keywords && keywords.length > 0 ? keywords.filter(k => k && k.trim() !== '') : null,
        commentReplies: commentReplies && commentReplies.length > 0 ? commentReplies.filter(r => r && r.trim() !== '') : null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        mediaId: true,
        igId: true,
        userId: true,
        dmMessage: true,
        dmLink: true,
        openingDmMessage: true,
        dmLinkButtonLabel: true,
        postbackButtonLabel: true,
        keywords: true,
        commentReplies: true,
        caption: true,
        mediaType: true,
        mediaUrl: true,
        permalink: true,
        timestamp: true,
        updatedAt: true,
      }
    });

    console.log(`[${new Date().toISOString()}] [${requestId}] Media settings updated successfully`, {
      mediaId,
      updatedFields: {
        postbackButtonLabel: updatedMedia.postbackButtonLabel,
        dmMessage: updatedMedia.dmMessage,
        openingDmMessage: updatedMedia.openingDmMessage,
        dmLink: updatedMedia.dmLink,
        dmLinkButtonLabel: updatedMedia.dmLinkButtonLabel,
        keywords: updatedMedia.keywords,
        commentReplies: updatedMedia.commentReplies,
      },
    });

    // Convert BigInt and timestamp for JSON serialization
    const serializedUpdatedMedia = {
      ...updatedMedia,
      igId: updatedMedia.igId.toString(),
      media_url: updatedMedia.mediaUrl,
      media_type: updatedMedia.mediaType,
      timestamp: updatedMedia.timestamp ? updatedMedia.timestamp.toISOString() : null,
      updatedAt: updatedMedia.updatedAt ? updatedMedia.updatedAt.toISOString() : null,
    };

    return NextResponse.json(
      {
        message: 'Media settings updated successfully',
        media: serializedUpdatedMedia,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] Media settings update error:`, error.message, error.stack);
    return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] [${requestId}] =================================================`);
  console.log(`[${new Date().toISOString()}] [${requestId}] DELETE /api/media/settings - REQUEST STARTED`);
  console.log(`[${new Date().toISOString()}] [${requestId}] Request URL:`, req.url);
  console.log(`[${new Date().toISOString()}] [${requestId}] Request method:`, req.method);
  console.log(`[${new Date().toISOString()}] [${requestId}] Request headers:`, JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  try {
    // Session validation
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 1: Getting server session...`);
    const session = await getServerSession(authOptions);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session retrieved:`, JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: No session found`);
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }
    
    if (!session.user) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: No user in session`);
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }
    
    if (!session.user.id) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: No user ID in session`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Session user object:`, JSON.stringify(session.user, null, 2));
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }
    
    if (!session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: No Instagram user ID in session`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Session user object:`, JSON.stringify(session.user, null, 2));
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }
    
    if (!session.user.instagramToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: No Instagram token in session`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Session user object:`, JSON.stringify(session.user, null, 2));
      return NextResponse.json({ message: 'Unauthorized or Instagram account not linked' }, { status: 401 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] ✅ STEP 1 COMPLETE: Session validation passed`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session details - User ID: ${session.user.id}, Instagram ID: ${session.user.instagramUserId}, Token length: ${session.user.instagramToken?.length || 0}`);

    // Extract mediaId from query parameters
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 2: Extracting mediaId from query parameters...`);
    const { searchParams } = new URL(req.url);
    console.log(`[${new Date().toISOString()}] [${requestId}] Full URL:`, req.url);
    console.log(`[${new Date().toISOString()}] [${requestId}] Search params:`, JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2));
    
    const mediaId = searchParams.get('mediaId');
    console.log(`[${new Date().toISOString()}] [${requestId}] Extracted mediaId:`, mediaId);
    console.log(`[${new Date().toISOString()}] [${requestId}] MediaId type:`, typeof mediaId);

    // Validate mediaId
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 3: Validating mediaId...`);
    if (!mediaId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: MediaId is null or undefined`);
      return NextResponse.json({ message: 'Invalid or missing mediaId' }, { status: 400 });
    }
    
    if (typeof mediaId !== 'string') {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: MediaId is not a string, got:`, typeof mediaId);
      return NextResponse.json({ message: 'Invalid or missing mediaId' }, { status: 400 });
    }
    
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(mediaId)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ VALIDATION FAILED: MediaId is not numeric, got:`, mediaId);
      return NextResponse.json({ message: 'Invalid or missing mediaId' }, { status: 400 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] ✅ STEP 3 COMPLETE: MediaId validation passed - ${mediaId}`);

    // Verify user in database
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 4: Verifying user in database...`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Looking for user with id:`, session.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, instagramUserId: true },
    });
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Database user query result:`, JSON.stringify(user, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));
    
    if (!user) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ USER VERIFICATION FAILED: User not found in database`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Search criteria - User ID: ${session.user.id}`);
      return NextResponse.json({ message: 'User not found or Instagram ID mismatch' }, { status: 403 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] User found - DB ID: ${user.id}, DB Instagram ID: ${user.instagramUserId}`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Session Instagram ID: ${session.user.instagramUserId}`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Instagram ID comparison: DB(${user.instagramUserId?.toString()}) vs Session(${session.user.instagramUserId})`);
    
    if (user.instagramUserId?.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ USER VERIFICATION FAILED: Instagram ID mismatch`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Database Instagram ID: ${user.instagramUserId?.toString()}`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Session Instagram ID: ${session.user.instagramUserId}`);
      return NextResponse.json({ message: 'User not found or Instagram ID mismatch' }, { status: 403 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] ✅ STEP 4 COMPLETE: User verification passed`);

    // Check if media exists and belongs to user
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 5: Checking media existence and ownership...`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Searching for media with ID:`, mediaId);
    
    const existingMedia = await prisma.media.findUnique({
      where: { mediaId },
      select: { 
        id: true, 
        igId: true, 
        mediaId: true,
        postbackButtonLabel: true,
        mediaType: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Media query result:`, JSON.stringify(existingMedia, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));

    if (!existingMedia) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ MEDIA NOT FOUND: No media with ID ${mediaId}`);
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Media found - Internal ID: ${existingMedia.id}, Media ID: ${existingMedia.mediaId}`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Media details - Type: ${existingMedia.mediaType}, Button: ${existingMedia.postbackButtonLabel}`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Media owner comparison: Media igId(${existingMedia.igId.toString()}) vs Session Instagram ID(${session.user.instagramUserId})`);

    if (existingMedia.igId.toString() !== session.user.instagramUserId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ OWNERSHIP VERIFICATION FAILED: Media not owned by user`);
      console.error(`[${new Date().toISOString()}] [${requestId}] Media igId: ${existingMedia.igId.toString()}`);
      console.error(`[${new Date().toISOString()}] [${requestId}] User Instagram ID: ${session.user.instagramUserId}`);
      return NextResponse.json({ message: 'Media not owned by user' }, { status: 403 });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] ✅ STEP 5 COMPLETE: Media ownership verified`);

    // Start deletion process
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 6: Starting deletion process...`);
    console.log(`[${new Date().toISOString()}] [${requestId}] About to delete media and related records for mediaId: ${mediaId}`);
    
    // Check for related comments before deletion
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 6a: Checking for related comments...`);
    const relatedComments = await prisma.comment.findMany({
      where: { mediaId: existingMedia.id },
      select: { id: true, text: true, createdAt: true }
    });
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Found ${relatedComments.length} related comments`);
    if (relatedComments.length > 0) {
      console.log(`[${new Date().toISOString()}] [${requestId}] Related comments details:`, JSON.stringify(relatedComments, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
    }

    // Use transaction to delete related records first, then the media
    console.log(`[${new Date().toISOString()}] [${requestId}] STEP 6b: Starting database transaction...`);
    const deletionResult = await prisma.$transaction(async (tx) => {
      console.log(`[${new Date().toISOString()}] [${requestId}] Transaction started - Deleting comments...`);
      
      // Delete all comments related to this media
      const deletedComments = await tx.comment.deleteMany({
        where: { mediaId: existingMedia.id }
      });
      
      console.log(`[${new Date().toISOString()}] [${requestId}] Comments deletion result:`, JSON.stringify(deletedComments, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log(`[${new Date().toISOString()}] [${requestId}] Successfully deleted ${deletedComments.count} comments`);
      
      console.log(`[${new Date().toISOString()}] [${requestId}] Now deleting media record...`);
      
      // Delete the media record
      const deletedMedia = await tx.media.delete({
        where: { mediaId }
      });
      
      console.log(`[${new Date().toISOString()}] [${requestId}] Media deletion result:`, JSON.stringify(deletedMedia, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      console.log(`[${new Date().toISOString()}] [${requestId}] Successfully deleted media with ID: ${deletedMedia.mediaId}`);
      
      return { deletedComments, deletedMedia };
    });
    
    console.log(`[${new Date().toISOString()}] [${requestId}] ✅ STEP 6 COMPLETE: Transaction completed successfully`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Final deletion summary:`, JSON.stringify(deletionResult, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${new Date().toISOString()}] [${requestId}] 🎉 DELETION SUCCESSFUL!`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Total operation duration: ${duration}ms`);
    console.log(`[${new Date().toISOString()}] [${requestId}] Deleted media summary:`, {
      mediaId,
      postbackButtonLabel: existingMedia.postbackButtonLabel,
      mediaType: existingMedia.mediaType,
      commentsDeleted: deletionResult.deletedComments.count,
      deletionTime: new Date().toISOString()
    });

    return NextResponse.json(
      {
        message: 'Media deleted successfully',
        deletedMediaId: mediaId,
        summary: {
          commentsDeleted: deletionResult.deletedComments.count,
          mediaType: existingMedia.mediaType,
          deletionTime: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${new Date().toISOString()}] [${requestId}] 💥 DELETION ERROR OCCURRED`);
    console.error(`[${new Date().toISOString()}] [${requestId}] Error name:`, error.name);
    console.error(`[${new Date().toISOString()}] [${requestId}] Error message:`, error.message);
    console.error(`[${new Date().toISOString()}] [${requestId}] Error code:`, error.code);
    console.error(`[${new Date().toISOString()}] [${requestId}] Error stack:`, error.stack);
    console.error(`[${new Date().toISOString()}] [${requestId}] Operation duration before error: ${duration}ms`);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Prisma P2025 - Record not found during deletion`);
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Prisma P2003 - Foreign key constraint violation`);
      return NextResponse.json({ message: 'Cannot delete media with related records' }, { status: 409 });
    }
    
    if (error.code === 'P2002') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Prisma P2002 - Unique constraint violation`);
    }
    
    if (error.code === 'P2016') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Prisma P2016 - Query interpretation error`);
    }
    
    console.error(`[${new Date().toISOString()}] [${requestId}] Returning 500 Internal Server Error`);
    return NextResponse.json({ 
      message: 'Internal server error', 
      details: error.message,
      requestId: requestId 
    }, { status: 500 });
    
  } finally {
    console.log(`[${new Date().toISOString()}] [${requestId}] CLEANUP: Disconnecting from Prisma...`);
    
    try {
      await prisma.$disconnect();
      console.log(`[${new Date().toISOString()}] [${requestId}] ✅ Prisma disconnected successfully`);
    } catch (disconnectError) {
      console.error(`[${new Date().toISOString()}] [${requestId}] ❌ Error during Prisma disconnect:`, disconnectError.message);
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    console.log(`[${new Date().toISOString()}] [${requestId}] REQUEST COMPLETED - Total duration: ${totalDuration}ms`);
    console.log(`[${new Date().toISOString()}] [${requestId}] =================================================`);
  }
}