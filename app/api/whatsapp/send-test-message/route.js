import { NextResponse } from 'next/server';
import axios from 'axios';

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Structured logging helper
const log = (message, data) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
};

export async function POST(request) {
  try {
    const { to, templateName, language, components } = await request.json();

    // Log incoming request
    log('Received send test message request', { to, templateName, language, components });

    // Input validation
    if (!to || !templateName || !language || !components) {
      log('Validation failed: Missing required fields', { to, templateName, language, components });
      return NextResponse.json(
        { error: 'Missing required fields: to, templateName, language, or components' },
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

    // Validate language
    const validLanguages = ['en_US', 'en_GB', 'es', 'fr', 'de'];
    if (!validLanguages.includes(language)) {
      log('Validation failed: Invalid language', { language });
      return NextResponse.json(
        { error: `Invalid language code. Must be one of: ${validLanguages.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate components
    if (!Array.isArray(components) || components.length !== 1 || components[0].type !== 'body') {
      log('Validation failed: Invalid components', { components });
      return NextResponse.json(
        { error: 'Components must be an array with a single body component' },
        { status: 400 }
      );
    }
    const bodyComponent = components[0];
    if (!bodyComponent.parameters || !Array.isArray(bodyComponent.parameters)) {
      log('Validation failed: Invalid parameters', { bodyComponent });
      return NextResponse.json(
        { error: 'Body component must have a parameters array' },
        { status: 400 }
      );
    }
    for (const param of bodyComponent.parameters) {
      if (param.type !== 'text' || !param.text) {
        log('Validation failed: Invalid parameter format', { parameter: param });
        return NextResponse.json(
          { error: 'Parameters must be text type with non-empty text' },
          { status: 400 }
        );
      }
    }

    // Prepare payload
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components,
      },
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

    log('Test message sent successfully', { response: response.data });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const errorDetails = error.response
      ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        }
      : { message: error.message, stack: error.stack };
    log('Error sending test message', errorDetails);

    const errorData = error.response ? error.response.data.error : {};
    let errorMsg = 'Failed to send test message';
    let status = error.response ? error.response.status : 500;

    if (errorData.code === 131026) {
      errorMsg = 'Recipient cannot receive this message. Check phone number or pending status.';
      status = 400;
    } else if (errorData.code === 131009) {
      errorMsg = 'Template not approved. Check WhatsApp Manager for status.';
      status = 400;
    } else if (errorData.code === 190) {
      errorMsg = 'Invalid access token. Verify your token in environment variables.';
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