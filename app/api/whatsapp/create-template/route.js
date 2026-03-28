// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const WABA_ID = process.env.WABA_ID; // Removed NEXT_PUBLIC_ for security
// const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// // Structured logging helper
// const log = (message, data) => {
//   console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
// };

// export async function POST(request) {
//   try {
//     const { templateName, category, language, components } = await request.json();

//     // Log incoming request
//     log('Received template creation request', { templateName, category, language, components });

//     // Input validation
//     if (!templateName || !category || !language || !components || !components.find(c => c.type === 'BODY')) {
//       log('Validation failed: Missing required fields', { templateName, category, language, components });
//       return NextResponse.json(
//         { error: 'Missing required fields: name, category, language, or body component' },
//         { status: 400 }
//       );
//     }

//     // Validate template name format
//     if (!/^[a-z0-9_]+$/.test(templateName)) {
//       log('Validation failed: Invalid template name format', { templateName });
//       return NextResponse.json(
//         { error: 'Template name must be lowercase, alphanumeric, or underscores' },
//         { status: 400 }
//       );
//     }

//     // Validate category
//     const validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
//     if (!validCategories.includes(category)) {
//       log('Validation failed: Invalid category', { category });
//       return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
//     }

//     // Validate language
//     const validLanguages = ['en_US', 'en_GB', 'es', 'fr', 'de', 'hi', 'it', 'pt_BR'];
//     if (!validLanguages.includes(language)) {
//       log('Validation failed: Invalid language', { language });
//       return NextResponse.json({ error: `Invalid language code. Must be one of: ${validLanguages.join(', ')}` }, { status: 400 });
//     }

//     // Validate components
//     const bodyComponent = components.find(c => c.type === 'BODY');
//     if (!bodyComponent || !bodyComponent.text || bodyComponent.text.length > 1024) {
//       log('Validation failed: Invalid body component', { bodyComponent });
//       return NextResponse.json(
//         { error: 'Body component is required and must be 1024 characters or less' },
//         { status: 400 }
//       );
//     }

//     // Validate variable samples
//     const variables = (bodyComponent.text.match(/{{[1-9][0-9]*}}/g) || []).sort();
//     if (variables.length > 0 && (!bodyComponent.example || !bodyComponent.example.body_text || bodyComponent.example.body_text[0].length !== variables.length)) {
//       log('Validation failed: Missing or incorrect variable samples', { variables, bodyComponent });
//       return NextResponse.json(
//         { error: 'Provide sample text for all variables in the body' },
//         { status: 400 }
//       );
//     }

//     const headerComponent = components.find(c => c.type === 'HEADER');
//     if (headerComponent && headerComponent.format === 'TEXT' && (!headerComponent.text || headerComponent.text.length > 60)) {
//       log('Validation failed: Invalid header text', { headerComponent });
//       return NextResponse.json(
//         { error: 'Header text must be 60 characters or less' },
//         { status: 400 }
//       );
//     }

//     const footerComponent = components.find(c => c.type === 'FOOTER');
//     if (footerComponent && (!footerComponent.text || footerComponent.text.length > 60)) {
//       log('Validation failed: Invalid footer text', { footerComponent });
//       return NextResponse.json(
//         { error: 'Footer text must be 60 characters or less' },
//         { status: 400 }
//       );
//     }

//     const buttonsComponent = components.find(c => c.type === 'BUTTONS');
//     if (buttonsComponent) {
//       if (!buttonsComponent.buttons || buttonsComponent.buttons.length > 3) {
//         log('Validation failed: Invalid button count', { buttons: buttonsComponent.buttons });
//         return NextResponse.json({ error: 'Maximum 3 buttons allowed' }, { status: 400 });
//       }
//       for (const btn of buttonsComponent.buttons) {
//         if (!['QUICK_REPLY', 'URL', 'PHONE_NUMBER'].includes(btn.type)) {
//           log('Validation failed: Invalid button type', { button: btn });
//           return NextResponse.json({ error: 'Invalid button type' }, { status: 400 });
//         }
//         if (!btn.text || btn.text.length > 20) {
//           log('Validation failed: Invalid button text', { button: btn });
//           return NextResponse.json(
//             { error: 'Button text must be 20 characters or less' },
//             { status: 400 }
//           );
//         }
//         if (btn.type === 'URL' && (!btn.url || !/^https?:\/\//.test(btn.url))) {
//           log('Validation failed: Invalid URL format', { button: btn });
//           return NextResponse.json({ error: 'Invalid URL format (must start with http:// or https://)' }, { status: 400 });
//         }
//         if (btn.type === 'PHONE_NUMBER' && (!btn.phone_number || !/^\+\d+$/.test(btn.phone_number))) {
//           log('Validation failed: Invalid phone number format', { button: btn });
//           return NextResponse.json({ error: 'Invalid phone number format (must start with + and contain digits only)' }, { status: 400 });
//         }
//       }
//     }

//     // Prepare payload
//     const payload = {
//       name: templateName,
//       category,
//       language,
//       components,
//     };

//     // Log payload (mask sensitive data)
//     log('Sending request to WhatsApp API', {
//       url: `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
//       payload,
//     });

//     const response = await axios.post(
//       `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${ACCESS_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     log('Template created successfully', { response: response.data });
//     return NextResponse.json(response.data, { status: 200 });
//   } catch (error) {
//     const errorDetails = error.response
//       ? {
//           status: error.response.status,
//           data: error.response.data,
//           headers: error.response.headers,
//         }
//       : { message: error.message, stack: error.stack };
//     log('Error creating template', errorDetails);

//     const errorData = error.response ? error.response.data.error : {};
//     let errorMsg = 'Failed to create template';
//     let status = error.response ? error.response.status : 500;

//     if (errorData.error_subcode === 2388024) {
//       errorMsg = 'Template name already exists for this language. Try a unique name (e.g., order_confirmation_2026).';
//       status = 400;
//     } else if (errorData.code === 100 && errorData.error_subcode === 33) {
//       errorMsg = 'Invalid parameter. Check template format and variable samples.';
//       status = 400;
//     } else if (errorData.code === 190) {
//       errorMsg = 'Invalid access token. Verify your token in environment variables.';
//       status = 401;
//     } else if (errorData.code === 80007) {
//       errorMsg = 'Rate limit exceeded. Please try again later.';
//       status = 429;
//     } else {
//       errorMsg = errorData.error_user_msg || errorData.message || errorMsg;
//     }

//     return NextResponse.json({ error: errorMsg }, { status });
//   }
// }



import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Structured logging helper
const log = (message, data) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
};

export async function POST(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.whatsappToken || !session?.user?.whatsappWabaId) {
      log('Session validation failed: Missing WhatsApp credentials', { session });
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing WhatsApp token or WABA ID in session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ACCESS_TOKEN = session.user.whatsappToken;
    const WABA_ID = session.user.whatsappWabaId;

    const { templateName, category, language, components } = await request.json();

    // Log incoming request
    log('Received template creation request', { templateName, category, language, components, wabaId: WABA_ID });

    // Input validation
    if (!templateName || !category || !language || !components || !components.find(c => c.type === 'BODY')) {
      log('Validation failed: Missing required fields', { templateName, category, language, components });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, category, language, or body component' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate template name format
    if (!/^[a-z0-9_]+$/.test(templateName)) {
      log('Validation failed: Invalid template name format', { templateName });
      return new Response(
        JSON.stringify({ error: 'Template name must be lowercase, alphanumeric, or underscores' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate category
    const validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
    if (!validCategories.includes(category)) {
      log('Validation failed: Invalid category', { category });
      return new Response(
        JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate language
    const validLanguages = ['en_US', 'en_GB', 'es', 'fr', 'de', 'hi', 'it', 'pt_BR'];
    if (!validLanguages.includes(language)) {
      log('Validation failed: Invalid language', { language });
      return new Response(
        JSON.stringify({ error: `Invalid language code. Must be one of: ${validLanguages.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate components
    const bodyComponent = components.find(c => c.type === 'BODY');
    if (!bodyComponent || !bodyComponent.text || bodyComponent.text.length > 1024) {
      log('Validation failed: Invalid body component', { bodyComponent });
      return new Response(
        JSON.stringify({ error: 'Body component is required and must be 1024 characters or less' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate variable samples
    const variables = (bodyComponent.text.match(/{{[1-9][0-9]*}}/g) || []).sort();
    if (variables.length > 0 && (!bodyComponent.example || !bodyComponent.example.body_text || bodyComponent.example.body_text[0].length !== variables.length)) {
      log('Validation failed: Missing or incorrect variable samples', { variables, bodyComponent });
      return new Response(
        JSON.stringify({ error: 'Provide sample text for all variables in the body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const headerComponent = components.find(c => c.type === 'HEADER');
    if (headerComponent && headerComponent.format === 'TEXT' && (!headerComponent.text || headerComponent.text.length > 60)) {
      log('Validation failed: Invalid header text', { headerComponent });
      return new Response(
        JSON.stringify({ error: 'Header text must be 60 characters or less' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const footerComponent = components.find(c => c.type === 'FOOTER');
    if (footerComponent && (!footerComponent.text || footerComponent.text.length > 60)) {
      log('Validation failed: Invalid footer text', { footerComponent });
      return new Response(
        JSON.stringify({ error: 'Footer text must be 60 characters or less' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const buttonsComponent = components.find(c => c.type === 'BUTTONS');
    if (buttonsComponent) {
      if (!buttonsComponent.buttons || buttonsComponent.buttons.length > 3) {
        log('Validation failed: Invalid button count', { buttons: buttonsComponent.buttons });
        return new Response(JSON.stringify({ error: 'Maximum 3 buttons allowed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      for (const btn of buttonsComponent.buttons) {
        if (!['QUICK_REPLY', 'URL', 'PHONE_NUMBER'].includes(btn.type)) {
          log('Validation failed: Invalid button type', { button: btn });
          return new Response(JSON.stringify({ error: 'Invalid button type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (!btn.text || btn.text.length > 20) {
          log('Validation failed: Invalid button text', { button: btn });
          return new Response(
            JSON.stringify({ error: 'Button text must be 20 characters or less' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (btn.type === 'URL' && (!btn.url || !/^https?:\/\//.test(btn.url))) {
          log('Validation failed: Invalid URL format', { button: btn });
          return new Response(
            JSON.stringify({ error: 'Invalid URL format (must start with http:// or https://)' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (btn.type === 'PHONE_NUMBER' && (!btn.phone_number || !/^\+\d+$/.test(btn.phone_number))) {
          log('Validation failed: Invalid phone number format', { button: btn });
          return new Response(
            JSON.stringify({ error: 'Invalid phone number format (must start with + and contain digits only)' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Prepare payload
    const payload = {
      name: templateName,
      category,
      language,
      components,
    };

    // Log payload
    log('Sending request to WhatsApp API', {
      url: `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
      payload,
    });

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('Template created successfully', { response: response.data });
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorDetails = error.response
      ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        }
      : { message: error.message, stack: error.stack };
    log('Error creating template', errorDetails);

    const errorData = error.response ? error.response.data.error : {};
    let errorMsg = 'Failed to create template';
    let status = error.response ? error.response.status : 500;

    if (errorData.error_subcode === 2388024) {
      errorMsg = 'Template name already exists for this language. Try a unique name (e.g., order_confirmation_2026).';
      status = 400;
    } else if (errorData.code === 100 && errorData.error_subcode === 33) {
      errorMsg = 'Invalid parameter. Check template format and variable samples.';
      status = 400;
    } else if (errorData.code === 190) {
      errorMsg = 'Invalid access token. Verify your session credentials.';
      status = 401;
    } else if (errorData.code === 80007) {
      errorMsg = 'Rate limit exceeded. Please try again later.';
      status = 429;
    } else {
      errorMsg = errorData.error_user_msg || errorData.message || errorMsg;
    }

    return new Response(JSON.stringify({ error: errorMsg }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}