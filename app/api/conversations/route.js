
// app/api/conversations/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import axios from 'axios';

const INSTAGRAM_API = 'https://graph.instagram.com/v23.0';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.instagramToken || !session?.user?.instagramUserId) {
    console.error('[ConversationsAPI] Unauthorized request:', {
      hasToken: !!session?.user?.instagramToken,
      hasUserId: !!session?.user?.instagramUserId,
    });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('[ConversationsAPI] Fetching conversations for:', {
    userId: session.user.instagramUserId,
    token: '[REDACTED]',
  });

  try {
    const response = await axios.get(
      `${INSTAGRAM_API}/${session.user.instagramUserId}/conversations`,
      {
        params: {
          platform: 'instagram',
          access_token: session.user.instagramToken,
          fields: 'id,participants,updated_time',
        },
      }
    );

    console.log('[ConversationsAPI] Instagram API response:', {
      status: response.status,
      dataLength: response.data.data?.length || 0,
      rawData: response.data,
    });

    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.warn('[ConversationsAPI] No conversations found or invalid data:', response.data);
      return new Response(JSON.stringify({ conversations: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const conversations = response.data.data
      .filter((conv) => {
        const hasParticipants = !!conv.participants?.data?.length;
        if (!hasParticipants) {
          console.warn('[ConversationsAPI] Skipping conversation with no participants:', conv.id);
        }
        return hasParticipants;
      })
      .map((conv) => {
        console.debug('[ConversationsAPI] Processing conversation:', conv.id);
        const otherParticipant = conv.participants.data.find(
          (p) => p.id !== session.user.instagramUserId
        );
        if (!otherParticipant) {
          console.warn('[ConversationsAPI] No other participant found in conversation:', conv.id);
          return null;
        }
        return {
          userId: otherParticipant.id,
          username: otherParticipant.username || otherParticipant.id,
          lastUpdated: conv.updated_time,
          conversationId: conv.id,
        };
      })
      .filter((conv) => conv !== null);

    console.log('[ConversationsAPI] Processed conversations:', {
      count: conversations.length,
      conversationIds: conversations.map((c) => c.conversationId),
    });

    return new Response(JSON.stringify({ conversations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ConversationsAPI] Error fetching conversations:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestUrl: error.config?.url,
      requestParams: error.config?.params,
    });
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
