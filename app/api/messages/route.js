
// app/api/messages/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import axios from 'axios';

const INSTAGRAM_API = 'https://graph.instagram.com/v23.0';

// Placeholder for isWithin24Hours (use your existing implementation)
async function isWithin24Hours(date, requestId) {
  // Replace with your actual function from webhook
  return true; // Assume valid for demonstration
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.instagramToken || !session?.user?.instagramUserId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing userId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Find conversation for the user
    const convResponse = await axios.get(
      `${INSTAGRAM_API}/${session.user.instagramUserId}/conversations`,
      {
        params: {
          platform: 'instagram',
          access_token: session.user.instagramToken,
          fields: 'id,participants',
          user_id: userId,
        },
      }
    );

    const conversation = convResponse.data.data[0];
    if (!conversation) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get message IDs
    const messagesResponse = await axios.get(
      `${INSTAGRAM_API}/${conversation.id}?fields=messages`,
      {
        params: {
          access_token: session.user.instagramToken,
        },
      }
    );

    // Fetch details for up to 20 most recent messages
    const messages = [];
    for (const msg of messagesResponse.data.messages.data.slice(0, 20)) {
      try {
        const msgDetails = await axios.get(
          `${INSTAGRAM_API}/${msg.id}?fields=id,created_time,from,to,message`,
          {
            params: { access_token: session.user.instagramToken },
          }
        );
        messages.push({
          sender: msgDetails.data.from.id === session.user.instagramUserId ? 'me' : 'other',
          text: msgDetails.data.message,
          timestamp: msgDetails.data.created_time,
        });
      } catch (error) {
        console.error(`Error fetching message ${msg.id}:`, error.response?.data || error.message);
      }
    }

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.instagramToken || !session?.user?.instagramUserId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { recipientId, message } = await request.json();
    if (!recipientId || !message) {
      return new Response(JSON.stringify({ error: 'Missing recipientId or message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check 7-day window
    const isValidWindow = await isWithin24Hours(new Date(), 'live-chat-request');
    const recipient = isValidWindow ? { id: recipientId } : { comment_id: recipientId };
    await axios.post(
      `${INSTAGRAM_API}/${session.user.instagramUserId}/messages`,
      {
        recipient,
        message: { text: message },
      },
      {
        params: { access_token: session.user.instagramToken },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
