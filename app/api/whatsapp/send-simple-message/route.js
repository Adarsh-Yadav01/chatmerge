import { NextResponse } from 'next/server';
import axios from 'axios';

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Log environment variables for debugging
console.log('Environment variables:', {
  PHONE_NUMBER_ID: PHONE_NUMBER_ID || 'Not set',
  ACCESS_TOKEN: ACCESS_TOKEN ? 'Set' : 'Not set',
});

// Structured logging helper
const log = (message, data) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
};

export async function POST(request) {
  try {
    const { to, text } = await request.json();

    // Log incoming request
    log('Received send simple message request', { to, text });

    // Input validation
    if (!to || !text) {
      log('Validation failed: Missing required fields', { to, text });
      return NextResponse.json(
        { error: 'Missing required fields: to or text' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+\d{10,15}$/.test(to)) {
      log('Validation failed: Invalid phone number format', { to });
      return NextResponse.json(
        { error: 'Invalid phone number format (must start with + and contain 10-15 digits)' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 4096) {
      log('Validation failed: Text too long', { textLength: text.length });
      return NextResponse.json(
        { error: 'Message text must be 4096 characters or less' },
        { status: 400 }
      );
    }

    // Check PHONE_NUMBER_ID
    if (!PHONE_NUMBER_ID) {
      log('Configuration error: PHONE_NUMBER_ID not set', {});
      return NextResponse.json(
        { error: 'Server configuration error: PHONE_NUMBER_ID is not set in environment variables' },
        { status: 500 }
      );
    }

    // Verify Phone Number ID
    try {
      const verifyResponse = await axios.get(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      log('Phone Number ID verification', { phoneNumberDetails: verifyResponse.data });
    } catch (verifyError) {
      const verifyErrorDetails = verifyError.response
        ? verifyError.response.data
        : { message: verifyError.message };
      log('Failed to verify Phone Number ID', { error: verifyErrorDetails });
      return NextResponse.json(
        {
          error:
            'Invalid Phone Number ID. Verify PHONE_NUMBER_ID in WhatsApp Business Manager or App Dashboard.',
        },
        { status: 400 }
      );
    }

    // Prepare payload
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    // Log payload
    log('Sending request to WhatsApp API', {
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      payload,
    });

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('Simple message sent successfully', { response: response.data });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const errorDetails = error.response
      ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        }
      : { message: error.message, stack: error.stack };
    log('Error sending simple message', errorDetails);

    const errorData = error.response ? error.response.data.error : {};
    let errorMsg = 'Failed to send simple message';
    let status = error.response ? error.response.status : 500;

    if (errorData.code === 100 && errorData.error_subcode === 33) {
      errorMsg = 'Invalid Phone Number ID or insufficient permissions. Verify PHONE_NUMBER_ID in WhatsApp Business Manager or App Dashboard.';
      status = 400;
    } else if (errorData.code === 131021) {
      errorMsg = 'Recipient has not opted in or no message received in last 24 hours.';
      status = 400;
    } else if (errorData.code === 131026) {
      errorMsg = 'Recipient cannot receive this message. Check phone number status in WhatsApp Business Manager.';
      status = 400;
    } else if (errorData.code === 190) {
      errorMsg = 'Invalid access token. Verify WHATSAPP_ACCESS_TOKEN in environment variables.';
      status = 401;
    } else if (errorData.code === 80007) {
      errorMsg = 'Rate limit exceeded. Please try again later.';
      status = 429;
    } else {
      errorMsg = errorData.error_user_msg || errorData.message || errorMsg;
    }

    return NextResponse.json({ error: errorMsg }, { status });
  }
}