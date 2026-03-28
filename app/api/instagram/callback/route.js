import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GRAPH_API_VERSION = 'v23.0'; // Match webhook version

// Utility for exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req) {
  try {
    // Validate environment variables
    if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET || !process.env.INSTAGRAM_REDIRECT_URI) {
      console.error('Missing required environment variables');
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'server_configuration_error');
      errorUrl.searchParams.append('message', 'Server is missing required Instagram configuration');
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    const queryString = req.url.split('?')[1];
    console.log('Instagram callback triggered, query:', queryString);

    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    console.log('Extracted code from query:', code, 'State:', state);

    if (!code) {
      console.error('No code provided in callback');
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'missing_code');
      errorUrl.searchParams.append('message', 'Authorization code is missing');
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    if (!state) {
      console.error('No state parameter provided');
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'missing_state');
      errorUrl.searchParams.append('message', 'State parameter is missing');
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // Decode state as user ID (UUID)
    const userId = Buffer.from(state, 'base64').toString('utf-8');
    console.log('Decoded user ID from state:', userId);

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error('Invalid or missing user ID in state');
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'invalid_state');
      errorUrl.searchParams.append('message', 'Invalid or missing user ID in state parameter');
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // STEP 1: Get short-lived access token
    const requestBody = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }).toString();

    console.log('Fetching short-lived access token with request body:', requestBody);

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody,
    });

    console.log('Short-lived token response status:', tokenResponse.status);
    const tokenData = await tokenResponse.json();
    console.log('Short-lived token response data:', tokenData);

    if (tokenData.error) {
      console.error('Token fetch error:', tokenData.error.message, 'Details:', tokenData.error);
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'instagram_token_error');
      errorUrl.searchParams.append('message', `Failed to get Instagram access token: ${tokenData.error.message}`);
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // Handle response structure (data array or flat object)
    const accessToken = tokenData.data ? tokenData.data[0].access_token : tokenData.access_token;
    const instagramUserIdFromToken = tokenData.data ? tokenData.data[0].user_id : tokenData.user_id;

    if (!accessToken) {
      console.error('No access token found in response');
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'instagram_token_error');
      errorUrl.searchParams.append('message', 'No access token found in response');
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // STEP 2: Exchange for long-lived access token
    let longLivedData;
    const longLivedUrl = new URL('https://graph.instagram.com/access_token');
    longLivedUrl.searchParams.append('grant_type', 'ig_exchange_token');
    longLivedUrl.searchParams.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
    longLivedUrl.searchParams.append('access_token', accessToken);

    console.log('Attempting long-lived token exchange with GET method, URL:', longLivedUrl.toString());

    // Try GET method first
    const longLivedResponse = await fetch(longLivedUrl.toString(), {
      method: 'GET',
    });

    console.log('Long-lived token GET response status:', longLivedResponse.status);
    longLivedData = await longLivedResponse.json();
    console.log('Long-lived token GET response data:', longLivedData);

    // Check if GET request failed with specific error
    if (longLivedData.error && longLivedData.error.code === 100 && longLivedData.error.message.includes('method type: get')) {
      console.log('GET method failed with "Unsupported request - method type: get". Retrying with POST method.');

      // Prepare POST request
      const postRequestBody = new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        access_token: accessToken,
      }).toString();

      const longLivedPostResponse = await fetch('https://graph.instagram.com/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postRequestBody,
      });

      console.log('Long-lived token POST response status:', longLivedPostResponse.status);
      longLivedData = await longLivedPostResponse.json();
      console.log('Long-lived token POST response data:', longLivedData);

      if (longLivedData.error) {
        console.error('Long-lived token exchange error (POST):', longLivedData.error.message, 'Details:', longLivedData.error);
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
        const errorUrl = new URL('/auth/error', baseUrl);
        errorUrl.searchParams.append('error', 'instagram_longlived_token_error');
        errorUrl.searchParams.append('message', `Failed to exchange for long-lived Instagram token: ${longLivedData.error.message}`);
        console.log('Redirecting to error page:', errorUrl.toString());
        return NextResponse.redirect(errorUrl);
      }
    } else if (longLivedData.error) {
      console.error('Long-lived token exchange error (GET):', longLivedData.error.message, 'Details:', longLivedData.error);
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'instagram_longlived_token_error');
      errorUrl.searchParams.append('message', `Failed to exchange for long-lived Instagram token: ${longLivedData.error.message}`);
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    const longLivedToken = longLivedData.access_token;

    // STEP 3: Fetch user_id and username from /me endpoint
    const meUrl = `https://graph.instagram.com/me?fields=user_id,username&access_token=${longLivedToken}`;
    console.log('Fetching Instagram user info from:', meUrl);

    const meResponse = await fetch(meUrl);
    console.log('Instagram /me endpoint response status:', meResponse.status);

    const meData = await meResponse.json();
    console.log('Instagram /me endpoint response data:', meData);

    if (meData.error) {
      console.error('Instagram /me endpoint error:', meData.error.message, 'Details:', meData.error);
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'instagram_user_info_error');
      errorUrl.searchParams.append('message', `Failed to fetch Instagram user information: ${meData.error.message}`);
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    const instagramUserId = BigInt(meData.user_id);
    const username = meData.username;

    console.log('Fetched Instagram user info:', { instagramUserId: meData.user_id, username });

    // STEP 4: Subscribe to webhook fields
    const subscribedFields = 'comments,messages,mentions,story_insights,live_comments'; // Adjust based on approved scopes
    let subscribeResponse;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        subscribeResponse = await fetch(`https://graph.instagram.com/${GRAPH_API_VERSION}/${instagramUserId}/subscribed_apps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            subscribed_fields: subscribedFields,
            access_token: longLivedToken,
          }).toString(),
        });

        console.log('Webhook subscription response status:', subscribeResponse.status);
        const subscribeData = await subscribeResponse.json();
        console.log('Webhook subscription response data:', subscribeData);

        if (subscribeData.success) {
          console.log('Webhook subscribed successfully for Instagram User ID:', instagramUserId.toString());
          break;
        } else {
          console.error(`Webhook subscription attempt ${attempt} failed:`, subscribeData.error);
          if (attempt < 3 && subscribeData.error?.code === 4) { // Rate limit
            await delay(1000 * attempt);
            continue;
          }
          throw new Error(subscribeData.error?.message || 'Webhook subscription failed');
        }
      } catch (error) {
        if (attempt === 3) {
          console.error('Webhook subscription error after retries:', error.message, subscribeData?.error);
          const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
          const errorUrl = new URL('/auth/error', baseUrl);
          errorUrl.searchParams.append('error', 'webhook_subscription_error');
          errorUrl.searchParams.append('message', `Failed to subscribe to webhooks: ${error.message}`);
          console.log('Redirecting to error page:', errorUrl.toString());
          return NextResponse.redirect(errorUrl);
        }
      }
    }

    // STEP 5: Check if Instagram account is already linked to another user
    console.log('Checking for existing Instagram user ID:', instagramUserId);

    const existingUser = await prisma.user.findUnique({
      where: { instagramUserId },
    });

    if (existingUser && existingUser.id !== userId) {
      console.error('Instagram account already linked to another user:', existingUser.id, 'Current user:', userId);
      const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
      const errorUrl = new URL('/auth/error', baseUrl);
      errorUrl.searchParams.append('error', 'instagram_already_linked');
      errorUrl.searchParams.append('message', `This Instagram account (${username}) is already linked to another user account (ID: ${existingUser.id})`);
      console.log('Redirecting to error page:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // STEP 6: Update user with Instagram data
    console.log('Updating user with long-lived instagramToken and Instagram user ID');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        instagramToken: longLivedToken,
        instagramUserId,
      },
    });

    console.log('User updated successfully for user ID:', userId);

    // Redirect to dashboard after successful completion
    // const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    // const successUrl = new URL('/dashboard/user', baseUrl);
    // successUrl.searchParams.append('instagram_connected', 'true');
    // successUrl.searchParams.append('username', username);
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
const successUrl = new URL('/dashboard', baseUrl);

    console.log('Instagram connection successful! Redirecting to dashboard:', successUrl.toString());
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Callback error:', error.message, error.stack);
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    const errorUrl = new URL('/auth/error', baseUrl);
    errorUrl.searchParams.append('error', 'internal_server_error');
    errorUrl.searchParams.append('message', `An unexpected error occurred during Instagram connection: ${error.message}`);
    console.log('Redirecting to error page due to exception:', errorUrl.toString());
    return NextResponse.redirect(errorUrl);
  } finally {
    await prisma.$disconnect();
  }
}