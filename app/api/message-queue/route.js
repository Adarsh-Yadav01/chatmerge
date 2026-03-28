
// // app/api/message-queue/route.js
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';

// // Local in-memory queue (temporary workaround)
// const messageQueue = new Map();

// export async function GET(request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.instagramUserId) {
//     console.error('[MessageQueueAPI] Unauthorized request:', {
//       hasUserId: !!session?.user?.instagramUserId,
//     });
//     return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//       status: 401,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }

//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   if (!userId) {
//     console.warn('[MessageQueueAPI] Missing userId parameter');
//     return new Response(JSON.stringify({ error: 'Missing userId' }), {
//       status: 400,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }

//   const queueKey = `${session.user.instagramUserId}:${userId}`;
//   const messages = messageQueue.get(queueKey) || [];

//   console.log('[MessageQueueAPI] Fetching queued messages:', {
//     queueKey,
//     messageCount: messages.length,
//   });

//   // Clear queue after fetching to avoid duplicates
//   if (messages.length > 0) {
//     messageQueue.set(queueKey, []);
//     console.debug('[MessageQueueAPI] Cleared queue for:', queueKey);
//   }

//   return new Response(JSON.stringify({ messages }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' },
//   });
// }

// // Export for webhook to add messages (if webhook exists)
// export { messageQueue };


// app/api/message-queue/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { messageQueue } from '../webhooks/instagram/route'; // Import shared messageQueue from webhook

export async function GET(request) {
  const requestId = crypto.randomUUID(); // Add requestId for consistent logging
  console.log(`[${new Date().toISOString()}] [${requestId}] [MessageQueueAPI] GET request received`);

  const session = await getServerSession(authOptions);
  if (!session?.user?.instagramUserId) {
    console.error(`[${new Date().toISOString()}] [${requestId}] [MessageQueueAPI] Unauthorized request`, {
      hasUserId: !!session?.user?.instagramUserId,
    });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    console.warn(`[${new Date().toISOString()}] [${requestId}] [MessageQueueAPI] Missing userId parameter`);
    return new Response(JSON.stringify({ error: 'Missing userId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const queueKey = `${session.user.instagramUserId}:${userId}`;
  const messages = messageQueue.get(queueKey) || [];

  console.log(`[${new Date().toISOString()}] [${requestId}] [MessageQueueAPI] Fetching queued messages`, {
    queueKey,
    messageCount: messages.length,
  });

  // Clear queue after fetching to avoid duplicates
  if (messages.length > 0) {
    messageQueue.set(queueKey, []);
    console.debug(`[${new Date().toISOString()}] [${requestId}] [MessageQueueAPI] Cleared queue for: ${queueKey}`);
  }

  return new Response(JSON.stringify({ messages }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    });
}