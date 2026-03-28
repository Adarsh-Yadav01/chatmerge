import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';



const prisma = new PrismaClient();
const INSTAGRAM_API = 'https://graph.instagram.com/v23.0';

// In-memory message queue for live chat
const messageQueue = new Map();
export { messageQueue };

/**
 * Broadcasts a notification via WebSocket to the user's room.
 * @param {string} userId - The user ID to send the notification to.
 * @param {object} payload - The notification payload.
 * @param {object} httpServer - Optional HTTP server instance (for API routes).
 */
const broadcastNotification = (userId, payload, httpServer) => {
  const io = getSocket(httpServer);
  if (!io) {
    console.error(`[${new Date().toISOString()}] [WebSocket] Cannot broadcast: Socket.IO not initialized`);
    return;
  }
  try {
    io.to(userId).emit('notification', payload);
    console.log(`[${new Date().toISOString()}] [WebSocket] Broadcasted notification to user ${userId}:`, payload);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [WebSocket] Broadcast failed: ${error.message}`);
  }
};

/**
 * Checks if a timestamp is within the 24-hour messaging window.
 * @param {Date|string|number} timestamp - The comment or event timestamp.
 * @param {string} requestId - Unique request identifier for logging.
 * @returns {boolean} True if within 24 hours, false otherwise.
 */
const isWithin24Hours = (timestamp, requestId) => {
  try {
    const commentTime = new Date(timestamp);
    if (isNaN(commentTime.getTime())) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid timestamp: ${timestamp}`);
      return false;
    }
    const now = new Date();
    const timeDiffMs = now - commentTime;
    const isWithin = timeDiffMs <= 24 * 60 * 60 * 1000; // 24 hours
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] 24-hour window check:`, {
      timestamp,
      timeDiffMs,
      isWithin,
    });
    return isWithin;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Timestamp parsing failed: ${error.message}`);
    return false;
  }
};

/**
 * Generates a random reply for a comment.
 * @param {string[]} replies - Array of possible reply messages.
 * @param {string} username - Username of the commenter.
 * @param {string} requestId - Unique request identifier for logging.
 * @returns {string} Formatted reply message.
 */
const getRandomReply = (replies, username, requestId) => {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Generating reply for username: ${username}`);
  if (!replies || replies.length === 0) {
    const reply = `Hey @${username}, thanks for commenting! Ref:${crypto.randomBytes(3).toString('hex')}`;
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Using default reply: ${reply}`);
    return reply;
  }
  const reply = replies[Math.floor(Math.random() * replies.length)];
  const formattedReply = `Hey @${username}, ${reply} Ref:${crypto.randomBytes(3).toString('hex')}`;
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Selected reply: ${formattedReply}`);
  return formattedReply;
};

/**
 * Implements a delay for exponential backoff.
 * @param {number} ms - Delay in milliseconds.
 * @param {string} requestId - Unique request identifier for logging.
 * @returns {Promise<void>}
 */
const delay = (ms, requestId) => {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Delaying for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Implements exponential backoff for retries.
 * @param {string} requestId - Unique request identifier for logging.
 * @param {number} attempt - Current attempt number.
 * @param {number} maxAttempts - Maximum number of attempts.
 * @param {number} baseDelay - Base delay in milliseconds.
 * @returns {Promise<boolean>} True if retry should continue, false if max attempts reached.
 */
const exponentialBackoff = async (requestId, attempt = 1, maxAttempts = 3, baseDelay = 2000) => {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Backoff attempt ${attempt}/${maxAttempts}`);
  if (attempt > maxAttempts) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Max backoff attempts reached`);
    return false;
  }
  const delayMs = baseDelay * Math.pow(2, attempt - 1);
  await delay(delayMs, requestId);
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Backoff attempt ${attempt} completed`);
  return true;
};

/**
 * Validates an Instagram access token.
 * @param {string} token - Instagram access token.
 * @param {string} igId - Instagram user ID.
 * @param {string} requestId - Unique request identifier for logging.
 * @returns {Promise<boolean>} True if token is valid, false otherwise.
 */
const validateToken = async (token, igId, requestId) => {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Validating token for igId: ${igId}`);
  try {
    const response = await axios.get(`${INSTAGRAM_API}/${igId}?fields=user_id,username&access_token=${token}`);
    if (response.data.user_id === igId) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Token valid for igId: ${igId}, username: ${response.data.username}`);
      return true;
    }
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token valid but for wrong igId: ${response.data.user_id}`);
    return false;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token validation failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
};

/**
 * Refreshes an Instagram access token.
 * @param {string} token - Current access token.
 * @param {string} userId - User ID in the database.
 * @param {string} requestId - Unique request identifier for logging.
 * @returns {Promise<string|null>} New token or null if refresh fails.
 */
const refreshToken = async (token, userId, requestId) => {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting to refresh token`);
  try {
    const response = await axios.get(`${INSTAGRAM_API}/refresh_access_token`, {
      params: { grant_type: 'ig_refresh_token', access_token: token },
    });
    const newToken = response.data.access_token;
    console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Token refreshed successfully`);
    await prisma.user.update({
      where: { id: userId },
      data: { instagramToken: newToken },
    });
    return newToken;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
};

/**
 * Handles GET requests for webhook verification.
 * @param {Request} req - Incoming request object.
 * @returns {Promise<NextResponse>} Response with challenge or error.
 */
export async function GET(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] [Request] GET request for webhook verification`);
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log(`[${new Date().toISOString()}] [${requestId}] [Request] Verification params:`, { mode, token });

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log(`[${new Date().toISOString()}] [${requestId}] [Request] Webhook verification successful`);
    return new NextResponse(challenge, { status: 200 });
  }

  console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Webhook verification failed`);
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}

/**
 * Handles POST requests for webhook events.
 * @param {Request} req - Incoming request object.
 * @returns {Promise<NextResponse>} Response indicating event processing status.
 */
export async function POST(req) {
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] [Request] POST request received for webhook`);

  try {
    const signature = req.headers.get('x-hub-signature-256');
    const isTestMode = process.env.NODE_ENV === 'development' && req.headers.get('x-test-signature');

    if (!process.env.INSTAGRAM_APP_SECRET) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Missing INSTAGRAM_APP_SECRET`);
      return NextResponse.json({ message: 'Configuration error: Missing APP_SECRET' }, { status: 500 });
    }

    const bodyText = await req.text();
    console.log(`[${new Date().toISOString()}] [${requestId}] [Request] Body:`, JSON.stringify(JSON.parse(bodyText), null, 2));
    const hash = crypto.createHmac('sha256', process.env.INSTAGRAM_APP_SECRET).update(bodyText).digest('hex');
    const expectedSignature = `sha256=${hash}`;
    const isValid = isTestMode ? req.headers.get('x-test-signature') === expectedSignature : signature === expectedSignature;

    if (!isValid) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid signature`, {
        received: isTestMode ? req.headers.get('x-test-signature') : signature,
        expected: expectedSignature,
      });
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(bodyText);
    if (data.object !== 'instagram' || !Array.isArray(data.entry)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid webhook payload`);
      return NextResponse.json({ message: 'EVENT_RECEIVED' }, { status: 200 });
    }

    for (const entry of data.entry) {
      if (!entry.id || (!entry.changes && !entry.messaging)) {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Request] Skipping invalid entry`);
        continue;
      }

      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'comments' && change.value?.media?.id && change.value?.id && !change.value.parent_id) {
            const { from, media, id: commentId, text } = change.value;
            const timestamp = entry.time ? new Date(entry.time * 1000) : new Date();
            console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Processing comment event:`, {
              userId: from.id,
              username: from.username,
              mediaId: media.id,
              commentId,
              text,
              timestamp,
            });
            await handleComment(from.id.toString(), media.id, commentId, text.toLowerCase(), entry.id, from.username, requestId, timestamp, req.httpServer);
          }
        }
      }

      if (entry.messaging) {
        for (const messaging of entry.messaging) {
          console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Processing messaging event:`, {
            sender: messaging.sender,
            recipient: messaging.recipient,
            message: messaging.message,
            postback: messaging.postback,
            isQuickReply: !!messaging.message?.quick_reply,
            isPostback: !!messaging.postback,
            isRead: !!messaging.read,
          });

          if (messaging.message?.text && !messaging.message.is_echo) {
            const userId = messaging.sender.id.toString();
            const businessUserId = messaging.recipient.id.toString();
            const text = messaging.message.text.toLowerCase();
            const timestamp = messaging.timestamp ? new Date(messaging.timestamp) : new Date();
            console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Processing direct message:`, {
              userId,
              businessUserId,
              text,
              timestamp,
            });
            await handleDirectMessage(userId, businessUserId, text, requestId, timestamp, req.httpServer);
          }

          if ((messaging.message?.quick_reply?.payload?.startsWith('get_link') || messaging.postback?.payload?.startsWith('get_link')) && !messaging.message?.is_echo) {
            const userId = messaging.sender.id.toString();
            const payload = messaging.message?.quick_reply?.payload || messaging.postback?.payload;
            const commentId = payload.replace('get_link_', '');
            console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Processing quick reply/postback:`, { userId, commentId, payload });

            if (!commentId || !/^\d+$/.test(commentId)) {
              console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid commentId extracted from payload: ${commentId}`);
              continue;
            }

            const comment = await prisma.comment.findFirst({
              where: { commentId, commentUserId: userId, tags: { has: 'opening_dm_sent' } },
              select: { mediaId: true, commentId: true },
            });

            if (comment) {
              console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Found comment for quick reply/postback:`, {
                userId,
                commentId: comment.commentId,
                mediaId: comment.mediaId,
              });
              await handleQuickReply(userId, comment.mediaId, comment.commentId, requestId, req.httpServer);
            } else {
              console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No comment found for quick reply/postback`, { userId, commentId });
              const allComments = await prisma.comment.findMany({
                where: { tags: { has: 'opening_dm_sent' } },
                select: { id: true, username: true, commentUserId: true, commentId: true, mediaId: true, tags: true },
              });
              console.log(`[${new Date().toISOString()}] [${requestId}] [Debug] All comments with 'opening_dm_sent':`, allComments);
            }
          } else if (messaging.read) {
            console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Processing read event:`, {
              userId: messaging.sender.id,
              messageId: messaging.read.mid,
            });
            await handleReadEvent(messaging.sender.id.toString(), messaging.read.mid, requestId);
          }
        }
      }
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Request] Webhook processing completed`);
    return NextResponse.json({ message: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Webhook processing failed: ${error.message}`, { stack: error.stack });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Handles comment events and sends automated replies, DMs, and notifications.
 * @param {string} userId - ID of the commenting user.
 * @param {string} mediaId - ID of the media (post) commented on.
 * @param {string} commentId - ID of the comment.
 * @param {string} text - Comment text.
 * @param {string} entryId - Webhook entry ID.
 * @param {string} username - Username of the commenter.
 * @param {string} requestId - Unique request identifier for logging.
 * @param {Date} timestamp - Timestamp of the comment or webhook event.
 * @param {object} httpServer - Optional HTTP server instance (for API routes).
 */
async function handleComment(userId, mediaId, commentId, text, entryId, username, requestId, timestamp = new Date(), httpServer) {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Handling comment:`, {
    commentId,
    userId,
    mediaId,
    text,
    entryId,
    username,
    timestamp,
  });

  try {
    const existingComment = await prisma.comment.findUnique({ where: { commentId } });
    if (existingComment) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Skipping duplicate comment: ${commentId}`);
      return;
    }

    const media = await prisma.media.findUnique({
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
        user: { select: { instagramToken: true, instagramUserId: true } },
      },
    });

    if (!media) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No media found for mediaId: ${mediaId}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Media] Fetched media:`, {
      mediaId: media.mediaId,
      igId: media.igId.toString(),
      userId: media.userId,
      dmMessage: media.dmMessage || 'null',
      dmLink: media.dmLink || 'null',
      openingDmMessage: media.openingDmMessage || 'null',
      dmLinkButtonLabel: media.dmLinkButtonLabel || 'null',
      postbackButtonLabel: media.postbackButtonLabel || 'null',
      keywords: media.keywords,
      commentReplies: media.commentReplies,
    });

    const userExists = await prisma.user.findUnique({
      where: { id: media.userId },
      select: { id: true },
    });

    if (!userExists) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid userId: ${media.userId}`);
      return;
    }

    // Create and store notification
    let notificationId;
    try {
      let actorUsername = username || userId;
      let contentUrl = null;
      let thumbnailUrl = null;
      let mediaType = null;

      // Fetch actor profile (username only)
      try {
        const actorProfile = await axios.get(`${INSTAGRAM_API}/${userId}?fields=username&access_token=${media.user.instagramToken}`, {
          timeout: 5000,
        });
        actorUsername = actorProfile.data.username || userId;
      } catch (error) {
        console.warn(`[${new Date().toISOString()}] [${requestId}] [Warning] Failed to fetch actor profile: ${error.message}`, {
          apiError: error.response?.data?.error?.message,
        });
      }

      // Fetch media details with retry
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const mediaData = await axios.get(`${INSTAGRAM_API}/${mediaId}?fields=permalink,thumbnail_url,media_url,media_type&access_token=${media.user.instagramToken}`, {
            timeout: 5000,
          });
          contentUrl = mediaData.data.permalink || null;
          thumbnailUrl = mediaData.data.thumbnail_url || mediaData.data.media_url || null;
          mediaType = mediaData.data.media_type || null;
          console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Fetched media details:`, {
            contentId: mediaId,
            contentUrl,
            thumbnailUrl,
            mediaType,
          });
          break;
        } catch (error) {
          console.warn(`[${new Date().toISOString()}] [${requestId}] [Warning] Failed to fetch media details (attempt ${attempt}): ${error.message}`, {
            apiError: error.response?.data?.error?.message,
          });
          if (attempt < 3 && [4, 32].includes(error.response?.data?.error?.code)) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }
          break;
        }
      }

      const notificationMessage = `New comment from @${actorUsername} on post ${mediaId}: ${text.substring(0, 100)}`;
      const notification = await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: media.userId,
          actionType: 'comment',
          message: notificationMessage,
          actorUserId: userId,
          actorUsername,
          actorProfilePicture: null,
          contentId: mediaId,
          contentType: 'post',
          contentUrl,
          thumbnailUrl,
          contextText: text,
          contextSnippet: text.substring(0, 50),
          isRead: false,
          isClicked: false,
          clickedAt: null,
          priority: 'medium',
          mediaType,
          createdAt: timestamp,
          updatedAt: new Date(),
        },
      });
      notificationId = notification.id;
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Stored notification:`, {
        id: notificationId,
        userId: media.userId,
        actionType: 'comment',
        message: notificationMessage,
        actorUserId: userId,
        actorUsername,
        contentId: mediaId,
        contentUrl,
        thumbnailUrl: thumbnailUrl || 'null',
        mediaType,
      });

      broadcastNotification(media.userId, {
        id: notificationId,
        actionType: 'comment',
        username: actorUsername,
        profilePicture: null,
        text,
        mediaId,
        commentId,
        contentUrl,
        thumbnailUrl,
        contextSnippet: text.substring(0, 50),
        priority: 'medium',
        mediaType,
        timestamp: timestamp.toISOString(),
      }, httpServer);
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Broadcasted notification for comment:`, { id: notificationId });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to store or broadcast comment notification: ${error.message}`, {
        stack: error.stack,
        apiError: error.response?.data?.error?.message,
      });
    }

    let token = media.user.instagramToken;
    if (!token) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No Instagram token for userId: ${media.userId}`);
      return;
    }

    if (!(await validateToken(token, media.igId.toString(), requestId))) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh`);
      token = await refreshToken(token, media.userId, requestId);
      if (!token) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
        await prisma.user.update({
          where: { id: media.userId },
          data: { instagramToken: null },
        });
        return;
      }
    }

    if (!media.dmMessage || !media.dmLink || !media.openingDmMessage) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Skipping DM: dmMessage, dmLink, or openingDmMessage not set`, {
        dmMessage: media.dmMessage,
        dmLink: media.dmLink,
        openingDmMessage: media.openingDmMessage,
      });
      return;
    }

    if (userId === media.user.instagramUserId.toString()) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Skipping DM: Comment from account owner`);
      return;
    }

    const keywords = media.keywords?.map(k => k.toLowerCase()) || ['any'];
    const matchedKeyword = keywords.includes('any') ? true : keywords.find(keyword => text.toLowerCase().includes(keyword));
    if (!matchedKeyword) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] No matching keywords found in comment: ${text}`);
      return;
    }

    const openingDmText = media.openingDmMessage.replace('${username}', username || userId);
    if (openingDmText.length > 640) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] openingDmMessage exceeds 640 characters: ${openingDmText.length}`);
      return;
    }

    const commentRecord = await prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        mediaId: media.id,
        userId: media.userId,
        commentId,
        username: username || userId,
        commentUserId: userId,
        text,
        sentDM: false,
        dmRead: false,
        dmClicked: false,
        tags: ['processed'],
        createdAt: timestamp,
        updatedAt: new Date(),
      },
    });

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Created comment record:`, {
      id: commentRecord.id,
      commentId,
      username: commentRecord.username,
      commentUserId: commentRecord.commentUserId,
      text,
      mediaId: media.id,
      userId: media.userId,
    });

    let replyStatus = 'failed';
    let replyError = null;
    const commentReply = getRandomReply(media.commentReplies, username || userId, requestId);
    const replyUrl = `${INSTAGRAM_API}/${commentId}/replies?message=${encodeURIComponent(commentReply)}&access_token=${token}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Sending comment reply (attempt ${attempt}): ${commentReply}`);
        const replyResponse = await axios.post(replyUrl, {}, {
          params: { access_token: token },
          headers: { 'X-Request-ID': requestId },
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Comment reply sent:`, replyResponse.data);
        replyStatus = 'sent';
        break;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Comment reply failed (attempt ${attempt}): ${error.response?.data?.error?.message || error.message}`);
        replyError = error.response?.data?.error?.message || error.message;
        if ([4, 32].includes(error.response?.data?.error?.code)) {
          if (await exponentialBackoff(requestId, attempt)) continue;
        }
        break;
      }
    }

    let dmStatus = 'failed';
    let dmError = null;
    const recipient = isWithin24Hours(timestamp, requestId) ? { id: userId } : { comment_id: commentId };
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Using recipient type:`, recipient);
    const dmUrl = `${INSTAGRAM_API}/${media.igId.toString()}/messages`;
    const dmPayload = {
      recipient,
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: openingDmText,
            buttons: [
              {
                type: 'postback',
                title: media.postbackButtonLabel || 'Send Link',
                payload: `get_link_${commentId}`,
              },
            ],
          },
        },
      },
    };
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Sending opening DM with button template:`, JSON.stringify(dmPayload, null, 2));

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const openingDMResponse = await axios.post(dmUrl, dmPayload, {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Opening DM sent:`, openingDMResponse.data);
        dmStatus = 'sent';
        await prisma.comment.update({
          where: { id: commentRecord.id },
          data: {
            sentDM: true,
            messageId: openingDMResponse.data.message_id,
            tags: ['processed', 'opening_dm_sent', 'dm_sent'],
            updatedAt: new Date(),
          },
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Updated comment with tags and messageId:`, {
          tags: ['processed', 'opening_dm_sent', 'dm_sent'],
          messageId: openingDMResponse.data.message_id,
        });
        break;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Opening DM failed (attempt ${attempt}): ${error.response?.data?.error?.message || error.message}`);
        dmError = error.response?.data?.error?.message || error.message;
        if ([4, 32].includes(error.response?.data?.error?.code)) {
          if (await exponentialBackoff(requestId, attempt)) continue;
        } else if (error.response?.data?.error?.code === 190) {
          console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh due to invalid token`);
          token = await refreshToken(token, media.userId, requestId);
          if (!token) {
            console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
            await prisma.user.update({
              where: { id: media.userId },
              data: { instagramToken: null },
            });
            break;
          }
          continue;
        } else if (error.response?.data?.error?.code === 10 && recipient.id) {
          console.log(`[${new Date().toISOString()}] [${requestId}] [Action] 24-hour window expired, retrying with comment_id`);
          dmPayload.recipient = { comment_id: commentId };
          console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Retrying with recipient:`, dmPayload.recipient);
          continue;
        }
        break;
      }
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Comment processing completed:`, {
      commentId,
      username: username || userId,
      text,
      matchedKeyword,
      replyStatus,
      replyError,
      dmStatus,
      dmError,
      recipientType: recipient.id ? 'user_id' : 'comment_id',
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Comment processing failed: ${error.message}`, { stack: error.stack });
  }
}

/**
 * Handles direct message events and sends automated DMs and notifications based on keyword matches.
 * @param {string} userId - ID of the user who sent the message.
 * @param {string} businessUserId - ID of the business user who received the message.
 * @param {string} text - Message text.
 * @param {string} requestId - Unique request identifier for logging.
 * @param {Date} timestamp - Timestamp of the message.
 * @param {object} httpServer - Optional HTTP server instance (for API routes).
 */
async function handleDirectMessage(userId, businessUserId, text, requestId, timestamp = new Date(), httpServer) {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Handling direct message:`, {
    userId,
    businessUserId,
    text,
    timestamp,
  });

  try {
    // Add message to in-memory queue for live chat
    const queueKey = `${businessUserId}:${userId}`;
    if (!messageQueue.has(queueKey)) {
      messageQueue.set(queueKey, []);
    }
    messageQueue.get(queueKey).push({
      sender: 'other',
      text,
      timestamp,
    });

    // Limit queue to 50 messages to manage memory
    if (messageQueue.get(queueKey).length > 50) {
      messageQueue.set(queueKey, messageQueue.get(queueKey).slice(-50));
    }
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Added message to queue:`, { queueKey, messageCount: messageQueue.get(queueKey).length });

    // Fetch the business user using instagramUserId
    const businessUser = await prisma.user.findUnique({
      where: { instagramUserId: businessUserId },
      select: {
        id: true,
        instagramToken: true,
        instagramUserId: true,
        dmSettings: {
          select: {
            id: true,
            keywords: true,
            dmMessage: true,
            dmLink: true,
            dmLinkButtonLabel: true,
          },
        },
      },
    });

    if (!businessUser) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No business user found for instagramUserId: ${businessUserId}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [User] Fetched business user:`, {
      userId: businessUser.id,
      instagramUserId: businessUser.instagramUserId,
      dmSettings: businessUser.dmSettings,
    });

    // Create and store notification
    let notificationId;
    try {
      // Fetch actor profile (username only) from Instagram API
      let actorUsername = userId;
      try {
        const actorProfile = await axios.get(`${INSTAGRAM_API}/${userId}?fields=username&access_token=${businessUser.instagramToken}`, {
          timeout: 5000,
        });
        actorUsername = actorProfile.data.username || userId;
      } catch (error) {
        console.warn(`[${new Date().toISOString()}] [${requestId}] [Warning] Failed to fetch actor profile: ${error.message}`, {
          apiError: error.response?.data?.error?.message,
        });
      }

      const notificationMessage = `New DM from @${actorUsername}: ${text.substring(0, 100)}`;
      const notification = await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: businessUser.id,
          actionType: 'direct_message',
          message: notificationMessage,
          actorUserId: userId,
          actorUsername,
          actorProfilePicture: null, // Omitted due to API restriction
          contentId: null,
          contentType: null,
          contentUrl: null,
          thumbnailUrl: null,
          contextText: text,
          contextSnippet: text.substring(0, 50),
          isRead: false,
          isClicked: false,
          clickedAt: null,
          priority: 'high',
          mediaType: null,
          createdAt: timestamp,
          updatedAt: new Date(),
        },
      });
      notificationId = notification.id;
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Stored notification:`, {
        id: notificationId,
        userId: businessUser.id,
        actionType: 'direct_message',
        message: notificationMessage,
        actorUserId: userId,
        actorUsername,
        contextSnippet: text.substring(0, 50),
        priority: 'high',
      });

      // Broadcast notification via WebSocket
      broadcastNotification(businessUser.id, {
        id: notificationId,
        actionType: 'direct_message',
        sender: 'other',
        username: actorUsername,
        profilePicture: null,
        text,
        contextSnippet: text.substring(0, 50),
        priority: 'high',
        timestamp: timestamp.toISOString(),
      }, httpServer);
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Broadcasted notification for direct message:`, { id: notificationId });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Failed to store or broadcast DM notification: ${error.message}`, {
        stack: error.stack,
        apiError: error.response?.data?.error?.message,
      });
    }

    if (!businessUser.instagramToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No Instagram token for business userId: ${businessUser.id}`);
      return;
    }

    if (userId === businessUser.instagramUserId) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Skipping DM: Message from account owner`);
      return;
    }

    const existingDM = await prisma.directMessage.findFirst({
      where: {
        userId: businessUser.id,
        messageUserId: userId,
        sentDM: true,
      },
      select: {
        id: true,
        messageText: true,
        sentDM: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingDM) {
      const timeSinceLastDM = new Date() - new Date(existingDM.createdAt);
      const hoursElapsed = timeSinceLastDM / (1000 * 60 * 60);

      if (hoursElapsed < 24) {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] DM already sent to user ${userId} within 24 hours (${hoursElapsed.toFixed(2)} hours ago). Skipping DM. Existing DM:`, {
          messageText: existingDM.messageText,
          sentDM: existingDM.sentDM,
          lastDMTime: existingDM.createdAt,
          hoursElapsed: hoursElapsed.toFixed(2),
        });
        return;
      } else {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] DM was sent to user ${userId} but more than 24 hours ago (${hoursElapsed.toFixed(2)} hours ago). Proceeding with new DM. Previous DM:`, {
          messageText: existingDM.messageText,
          lastDMTime: existingDM.createdAt,
          hoursElapsed: hoursElapsed.toFixed(2),
        });
      }
    }

    const dmSettings = businessUser.dmSettings.find(setting =>
      setting.keywords?.map(k => k.toLowerCase()).some(keyword => text.toLowerCase().includes(keyword))
    );

    if (!dmSettings) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] No matching keywords found in message: ${text}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Matched DM settings:`, {
      dmSettingsId: dmSettings.id,
      keywords: dmSettings.keywords,
      dmMessage: dmSettings.dmMessage,
      dmLink: dmSettings.dmLink,
      dmLinkButtonLabel: dmSettings.dmLinkButtonLabel,
    });

    if (!dmSettings.dmMessage || !dmSettings.dmLink) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Skipping DM: dmMessage or dmLink not set`, {
        dmMessage: dmSettings.dmMessage,
        dmLink: dmSettings.dmLink,
      });
      return;
    }

    let isValidUrl = false;
    try {
      new URL(dmSettings.dmLink);
      isValidUrl = true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid dmLink URL: ${dmSettings.dmLink}`);
      return;
    }

    if (!isValidUrl) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Skipping DM: dmLink is not a valid URL`);
      return;
    }

    const buttonLabel = dmSettings.dmLinkButtonLabel || 'Link';
    if (buttonLabel.length > 20) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] dmLinkButtonLabel exceeds 20 characters: ${buttonLabel.length}`);
      return;
    }

    if (dmSettings.dmMessage.length > 640) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] dmMessage exceeds 640 characters: ${dmSettings.dmMessage.length}`);
      return;
    }

    let token = businessUser.instagramToken;
    if (!(await validateToken(token, businessUser.instagramUserId, requestId))) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh`);
      token = await refreshToken(token, businessUser.id, requestId);
      if (!token) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
        await prisma.user.update({
          where: { id: businessUser.id },
          data: { instagramToken: null },
        });
        return;
      }
    }

    const dmRecord = await prisma.directMessage.create({
      data: {
        id: crypto.randomUUID(),
        userId: businessUser.id,
        messageUserId: userId,
        messageText: text,
        sentDM: false,
        dmRead: false,
        tags: ['processed'],
        createdAt: timestamp,
        updatedAt: new Date(),
      },
    });

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Created direct message record:`, {
      id: dmRecord.id,
      userId: businessUser.id,
      messageUserId: userId,
      messageText: text,
    });

    let dmStatus = 'failed';
    let dmError = null;
    const dmUrl = `${INSTAGRAM_API}/${businessUser.instagramUserId}/messages`;
    const dmPayload = {
      recipient: { id: userId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: dmSettings.dmMessage,
            buttons: [
              {
                type: 'web_url',
                title: buttonLabel,
                url: dmSettings.dmLink,
              },
            ],
          },
        },
      },
    };
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Sending DM with button template:`, JSON.stringify(dmPayload, null, 2));

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const dmResponse = await axios.post(dmUrl, dmPayload, {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] DM sent:`, dmResponse.data);
        dmStatus = 'sent';
        await prisma.directMessage.update({
          where: { id: dmRecord.id },
          data: {
            sentDM: true,
            tags: ['processed', 'dm_sent'],
            updatedAt: new Date(),
          },
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Updated direct message with tags:`, ['processed', 'dm_sent']);
        break;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [Error] DM failed (attempt ${attempt}): ${error.response?.data?.error?.message || error.message}`);
        dmError = error.response?.data?.error?.message || error.message;
        if ([4, 32].includes(error.response?.data?.error?.code)) {
          if (await exponentialBackoff(requestId, attempt)) continue;
        } else if (error.response?.data?.error?.code === 190) {
          console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh due to invalid token`);
          token = await refreshToken(token, businessUser.id, requestId);
          if (!token) {
            console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
            await prisma.user.update({
              where: { id: businessUser.id },
              data: { instagramToken: null },
            });
            break;
          }
          continue;
        }
        break;
      }
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Direct message processing completed:`, {
      userId,
      businessUserId,
      text,
      dmStatus,
      dmError,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Direct message processing failed: ${error.message}`, { stack: error.stack });
  }
}

/**
 * Handles quick reply or postback events and sends follow-up DMs.
 * @param {string} userId - ID of the user who triggered the quick reply.
 * @param {string} mediaId - ID of the media (post).
 * @param {string} commentId - ID of the comment.
 * @param {string} requestId - Unique request identifier for logging.
 * @param {object} httpServer - Optional HTTP server instance (for API routes).
 */
async function handleQuickReply(userId, mediaId, commentId, requestId, httpServer) {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Handling quick reply/postback:`, { userId, mediaId, commentId });

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      mediaId: true,
      igId: true,
      userId: true,
      dmMessage: true,
      dmLink: true,
      dmLinkButtonLabel: true,
      user: { select: { instagramToken: true } },
    },
  });

  if (!media) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No media found for mediaId: ${mediaId}`);
    return;
  }

  console.log(`[${new Date().toISOString()}] [${requestId}] [Media] Fetched media:`, {
    id: media.id,
    mediaId: media.mediaId,
    igId: media.igId.toString(),
    userId: media.userId,
    dmMessage: media.dmMessage || 'null',
    dmLink: media.dmLink || 'null',
    dmLinkButtonLabel: media.dmLinkButtonLabel || 'null',
  });

  if (!media.user.instagramToken) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No Instagram token for userId: ${media.userId}`);
    return;
  }

  if (!media.dmMessage || !media.dmLink) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Skipping DM: dmMessage or dmLink not set`, {
      dmMessage: media.dmMessage,
      dmLink: media.dmLink,
    });
    return;
  }

  let isValidUrl = false;
  try {
    new URL(media.dmLink);
    isValidUrl = true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Invalid dmLink URL: ${media.dmLink}`);
    return;
  }

  if (!isValidUrl) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Skipping DM: dmLink is not a valid URL`);
    return;
  }

  const buttonLabel = media.dmLinkButtonLabel || 'Link';
  if (buttonLabel.length > 20) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] dmLinkButtonLabel exceeds 20 characters: ${buttonLabel.length}`);
    return;
  }

  let token = media.user.instagramToken;
  if (!(await validateToken(token, media.igId.toString(), requestId))) {
    console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh`);
    token = await refreshToken(token, media.userId, requestId);
    if (!token) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
      await prisma.user.update({
        where: { id: media.userId },
        data: { instagramToken: null },
      });
      return;
    }
  }

  const comment = await prisma.comment.findUnique({
    where: { commentId },
    select: { createdAt: true },
  });

  if (!comment) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] No comment found for commentId: ${commentId}`);
    return;
  }

  let dmStatus = 'failed';
  let dmError = null;
  const recipient = isWithin24Hours(comment.createdAt, requestId) ? { id: userId } : { comment_id: commentId };
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Using recipient type:`, recipient);
  const dmUrl = `${INSTAGRAM_API}/${media.igId.toString()}/messages`;
  const dmPayload = {
    recipient,
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: media.dmMessage,
          buttons: [
            {
              type: 'web_url',
              title: buttonLabel,
              url: media.dmLink,
            },
          ],
        },
      },
    },
  };
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Sending follow-up DM with button template:`, JSON.stringify(dmPayload, null, 2));

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const mainDMResponse = await axios.post(dmUrl, dmPayload, {
        params: { access_token: token },
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      });
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Follow-up DM sent:`, mainDMResponse.data);
      dmStatus = 'sent';
      await prisma.comment.update({
        where: { commentId },
        data: {
          sentDM: true,
          tags: ['processed', 'opening_dm_sent', 'follow_up_dm_sent'],
          updatedAt: new Date(),
        },
      });
      console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Updated comment with tags:`, ['processed', 'opening_dm_sent', 'follow_up_dm_sent']);
      break;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Follow-up DM failed (attempt ${attempt}): ${error.response?.data?.error?.message || error.message}`);
      dmError = error.response?.data?.error?.message || error.message;
      if ([4, 32].includes(error.response?.data?.error?.code)) {
        if (await exponentialBackoff(requestId, attempt)) continue;
      } else if (error.response?.data?.error?.code === 190) {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Token] Attempting token refresh due to invalid token`);
        token = await refreshToken(token, media.userId, requestId);
        if (!token) {
          console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Token refresh failed, aborting`);
          await prisma.user.update({
            where: { id: media.userId },
            data: { instagramToken: null },
          });
          break;
        }
        continue;
      } else if (error.response?.data?.error?.code === 10 && recipient.id) {
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] 24-hour window expired, retrying with comment_id`);
        dmPayload.recipient = { comment_id: commentId };
        console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Retrying with recipient:`, dmPayload.recipient);
        continue;
      }
      break;
    }
  }

  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Quick reply/postback processing completed:`, {
    userId,
    mediaId,
    commentId,
    dmStatus,
    dmError,
    recipientType: recipient.id ? 'user_id' : 'comment_id',
  });
}

/**
 * Handles read events for DMs.
 * @param {string} userId - ID of the user who read the DM.
 * @param {string} messageId - ID of the read message.
 * @param {string} requestId - Unique request identifier for logging.
 */
async function handleReadEvent(userId, messageId, requestId) {
  console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Handling read event:`, { userId, messageId });

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Querying comment for read event:`, { userId });
    const updatedComments = await prisma.comment.updateMany({
      where: { commentUserId: userId, tags: { has: 'dm_sent' } },
      data: { dmRead: true, updatedAt: new Date() },
    });
    console.log(`[${new Date().toISOString()}] [${requestId}] [Action] Read event processed, updated ${updatedComments.count} comments`);
    if (updatedComments.count === 0) {
      const allComments = await prisma.comment.findMany({
        where: { tags: { has: 'dm_sent' } },
        select: { id: true, username: true, commentUserId: true, commentId: true, mediaId: true, tags: true },
      });
      console.log(`[${new Date().toISOString()}] [${requestId}] [Debug] All comments with 'dm_sent':`, allComments);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [Error] Read event processing failed: ${error.message}`, { stack: error.stack });
  }
}