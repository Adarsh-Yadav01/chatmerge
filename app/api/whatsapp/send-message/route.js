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
    log('Received send message request', { to, templateName, language, components });

    // Input validation
    if (!to || !templateName || !language) {
      log('Validation failed: Missing required fields', { to, templateName, language });
      return NextResponse.json(
        { error: 'Missing required fields: to, templateName, or language' },
        { status: 400 }
      );
    }

    // Validate phone number format (more flexible)
    if (!/^\+\d{1,15}$/.test(to)) {
      log('Validation failed: Invalid phone number format', { to });
      return NextResponse.json(
        { error: 'Invalid phone number format (must start with + and contain 1-15 digits)' },
        { status: 400 }
      );
    }

    // More comprehensive language validation (including 'en' which is in your API response)
    const validLanguages = ['en', 'en_US', 'en_GB', 'es', 'fr', 'de', 'hi', 'it', 'pt_BR', 'pt', 'ar', 'id', 'ru', 'zh_CN', 'zh_TW'];
    if (!validLanguages.includes(language)) {
      log('Warning: Uncommon language code', { language });
      // Don't fail - WhatsApp supports many languages
    }

    // Validate components (can be empty array or undefined for templates without variables)
    if (components && !Array.isArray(components)) {
      log('Validation failed: Components must be an array', { components });
      return NextResponse.json({ error: 'Components must be an array' }, { status: 400 });
    }

    // Validate component structure if provided
    if (components && components.length > 0) {
      for (const comp of components) {
        // Allow 'header', 'body', 'button' types
        if (!['header', 'body', 'button'].includes(comp.type)) {
          log('Validation failed: Invalid component type', { component: comp });
          return NextResponse.json(
            { error: `Invalid component type: ${comp.type}. Must be 'header', 'body', or 'button'` },
            { status: 400 }
          );
        }

        if (!comp.parameters || !Array.isArray(comp.parameters)) {
          log('Validation failed: Invalid component parameters', { component: comp });
          return NextResponse.json(
            { error: 'Component must include parameters array' },
            { status: 400 }
          );
        }

        // Validate parameters based on type
        for (const param of comp.parameters) {
          if (comp.type === 'body') {
            // Body parameters must be text
            if (param.type !== 'text' || typeof param.text !== 'string') {
              log('Validation failed: Body parameter must be text', { parameter: param });
              return NextResponse.json(
                { error: 'Body parameters must be type "text" with a text value' },
                { status: 400 }
              );
            }
          } else if (comp.type === 'header') {
            // Header can be image, document, video, or text
            const validHeaderTypes = ['image', 'document', 'video', 'text'];
            if (!validHeaderTypes.includes(param.type)) {
              log('Validation failed: Invalid header parameter type', { parameter: param });
              return NextResponse.json(
                { error: `Header parameter type must be one of: ${validHeaderTypes.join(', ')}` },
                { status: 400 }
              );
            }

            // For media types, validate structure
            if (['image', 'document', 'video'].includes(param.type)) {
              if (!param[param.type] || !param[param.type].link) {
                log('Validation failed: Media parameter missing link', { parameter: param });
                return NextResponse.json(
                  { error: `${param.type} parameter must include a link` },
                  { status: 400 }
                );
              }
            }
          }
        }
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
      },
    };

    // Only add components if they exist and have items
    if (components && components.length > 0) {
      payload.template.components = components;
    }

    // Log payload (mask sensitive data in production)
    log('Sending request to WhatsApp API', {
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      payload: {
        ...payload,
        to: payload.to.substring(0, 5) + '****', // Mask phone number in logs
      },
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

    log('Message sent successfully', { 
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status 
    });
    
    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error) {
    // Enhanced error handling
    const errorDetails = error.response
      ? {
          status: error.response.status,
          statusText: error.response.statusText,
          error: error.response.data.error,
          errorData: error.response.data,
        }
      : { 
          message: error.message, 
          name: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        };
    
    log('Error sending message', errorDetails);

    // Extract error information
    const errorData = error.response?.data?.error || {};
    let errorMsg = 'Failed to send message';
    let status = error.response?.status || 500;
    let errorCode = errorData.code;

    // Map common WhatsApp API error codes to user-friendly messages
    const errorMessages = {
      // Authentication & Authorization
      190: 'Invalid access token. Please check your WhatsApp API credentials.',
      10: 'Permission denied. Check your WhatsApp Business Account permissions.',
      
      // Template Issues
      131009: 'Template not approved or not found. Please verify the template in Meta Business Manager.',
      131026: 'Message could not be sent. The recipient number may be invalid or cannot receive messages.',
      131047: 'Re-engagement message required. User must initiate conversation first or use an approved template.',
      131051: 'Unsupported message type for template.',
      
      // Parameter Issues  
      100: 'Invalid parameter provided. Check your template parameters.',
      132000: 'Template parameter count mismatch. Check the number of parameters.',
      132001: 'Template parameter format error. Check parameter types and values.',
      132005: 'Template header parameter error. Check header media URL or format.',
      132012: 'Template button parameter error. Check button parameters.',
      132015: 'Template component parameters malformed.',
      132016: 'Template parameter value too long.',
      
      // Rate Limiting
      80007: 'Rate limit exceeded. Please wait before sending more messages.',
      130429: 'Rate limit hit. Too many messages sent in a short time.',
      
      // Recipient Issues
      131031: 'Recipient phone number not registered on WhatsApp.',
      131042: 'Recipient has blocked your business number.',
      131045: 'Recipient cannot receive messages at this time.',
      131048: 'Media message failed. Check media URL and format.',
      
      // Account Issues
      368: 'Temporarily blocked for policy violations. Check your account status.',
      131056: 'Monthly conversation limit reached.',
    };

    // Get user-friendly error message
    if (errorCode && errorMessages[errorCode]) {
      errorMsg = errorMessages[errorCode];
      status = [80007, 130429].includes(errorCode) ? 429 : 
               [190, 10].includes(errorCode) ? 401 : 400;
    } else if (errorData.error_user_msg) {
      errorMsg = errorData.error_user_msg;
    } else if (errorData.message) {
      errorMsg = errorData.message;
    } else if (errorData.error_user_title) {
      errorMsg = `${errorData.error_user_title}: ${errorData.error_user_msg || 'Unknown error'}`;
    }

    // Add error code to message for debugging
    const detailedError = errorCode 
      ? `${errorMsg} (Error Code: ${errorCode})`
      : errorMsg;

    return NextResponse.json(
      { 
        error: {
          message: detailedError,
          code: errorCode,
          type: errorData.type,
          details: process.env.NODE_ENV === 'development' ? errorData : undefined
        }
      },
      { status }
    );
  }
}