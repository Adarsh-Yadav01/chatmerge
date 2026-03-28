

// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const WABA_ID = process.env.WABA_ID;
// const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// // Structured logging helper
// const log = (message, data) => {
//   console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
// };

// // Detailed template logger
// const logTemplateDetails = (templates) => {
//   console.log('\n' + '='.repeat(80));
//   console.log('📋 WHATSAPP TEMPLATE RESPONSE DETAILS');
//   console.log('='.repeat(80) + '\n');

//   console.log(`📊 Total Templates Fetched: ${templates.length}\n`);

//   templates.forEach((template, index) => {
//     console.log(`\n${'─'.repeat(80)}`);
//     console.log(`🔹 TEMPLATE ${index + 1}: ${template.name}`);
//     console.log(`${'─'.repeat(80)}`);
    
//     // Basic Info
//     console.log('\n📌 Basic Information:');
//     console.log(`   • ID: ${template.id}`);
//     console.log(`   • Name: ${template.name}`);
//     console.log(`   • Status: ${template.status}`);
//     console.log(`   • Category: ${template.category}`);
//     console.log(`   • Language: ${template.language}`);
    
//     // Quality Score (if available)
//     if (template.quality_score) {
//       console.log('\n⭐ Quality Score:');
//       console.log(`   • Score: ${template.quality_score.score}`);
//       console.log(`   • Date: ${template.quality_score.date}`);
//     }

//     // Components
//     console.log('\n🧩 Components:');
//     if (template.components && template.components.length > 0) {
//       template.components.forEach((component, compIndex) => {
//         console.log(`\n   ${compIndex + 1}. ${component.type}:`);
        
//         if (component.type === 'HEADER') {
//           console.log(`      • Format: ${component.format}`);
//           if (component.text) {
//             console.log(`      • Text: "${component.text}"`);
//           }
//           if (component.example && component.example.header_handle) {
//             console.log(`      • Example: ${JSON.stringify(component.example.header_handle)}`);
//           }
//         }
        
//         if (component.type === 'BODY') {
//           console.log(`      • Text: "${component.text}"`);
//           const variables = component.text.match(/{{[1-9][0-9]*}}/g);
//           if (variables) {
//             console.log(`      • Variables: ${variables.join(', ')}`);
//           }
//           if (component.example && component.example.body_text) {
//             console.log(`      • Example Values:`);
//             component.example.body_text[0].forEach((val, idx) => {
//               console.log(`         {{${idx + 1}}}: "${val}"`);
//             });
//           }
//         }
        
//         if (component.type === 'FOOTER') {
//           console.log(`      • Text: "${component.text}"`);
//         }
        
//         if (component.type === 'BUTTONS') {
//           console.log(`      • Buttons (${component.buttons.length}):`);
//           component.buttons.forEach((btn, btnIdx) => {
//             console.log(`         ${btnIdx + 1}. Type: ${btn.type}`);
//             console.log(`            Text: "${btn.text}"`);
//             if (btn.url) console.log(`            URL: ${btn.url}`);
//             if (btn.phone_number) console.log(`            Phone: ${btn.phone_number}`);
//           });
//         }
//       });
//     } else {
//       console.log('   ⚠️  No components found');
//     }

//     // Raw JSON for reference
//     console.log('\n📄 Raw Template JSON:');
//     console.log(JSON.stringify(template, null, 2));
//   });

//   console.log('\n' + '='.repeat(80));
//   console.log('✅ END OF TEMPLATE DETAILS');
//   console.log('='.repeat(80) + '\n');
// };

// export async function GET() {
//   try {
//     log('Fetching template list', { wabaId: WABA_ID });
    
//     const response = await axios.get(
//       `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
//       {
//         headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
//       }
//     );
    
//     log('Templates fetched successfully', { 
//       count: response.data.data.length,
//       hasNextPage: !!response.data.paging?.next 
//     });

//     // Log detailed template information
//     if (response.data.data && response.data.data.length > 0) {
//       logTemplateDetails(response.data.data);
//     } else {
//       console.log('⚠️  No templates found in response');
//     }

//     // Log the complete response structure
//     console.log('\n📦 Complete API Response Structure:');
//     console.log(JSON.stringify(response.data, null, 2));

//     return NextResponse.json(response.data, { status: 200 });
//   } catch (error) {
//     const errorDetails = error.response
//       ? {
//           status: error.response.status,
//           statusText: error.response.statusText,
//           data: error.response.data,
//           headers: error.response.headers,
//         }
//       : { 
//           message: error.message, 
//           stack: error.stack 
//         };
    
//     console.error('\n' + '❌'.repeat(40));
//     console.error('ERROR FETCHING TEMPLATES');
//     console.error('❌'.repeat(40));
//     log('Error fetching templates', errorDetails);
//     console.error(JSON.stringify(errorDetails, null, 2));
//     console.error('❌'.repeat(40) + '\n');
    
//     return NextResponse.json(
//       { error: error.response ? error.response.data.error?.message : 'Failed to list templates' },
//       { status: error.response ? error.response.status : 500 }
//     );
//   }
// }

import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Structured logging helper
const log = (message, data) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message, ...data }, null, 2));
};

// Detailed template logger
const logTemplateDetails = (templates) => {
  console.log('\n' + '='.repeat(80));
  console.log('📋 WHATSAPP TEMPLATE RESPONSE DETAILS');
  console.log('='.repeat(80) + '\n');

  console.log(`📊 Total Templates Fetched: ${templates.length}\n`);

  templates.forEach((template, index) => {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`🔹 TEMPLATE ${index + 1}: ${template.name}`);
    console.log(`${'─'.repeat(80)}`);
    
    // Basic Info
    console.log('\n📌 Basic Information:');
    console.log(`   • ID: ${template.id}`);
    console.log(`   • Name: ${template.name}`);
    console.log(`   • Status: ${template.status}`);
    console.log(`   • Category: ${template.category}`);
    console.log(`   • Language: ${template.language}`);
    
    // Quality Score (if available)
    if (template.quality_score) {
      console.log('\n⭐ Quality Score:');
      console.log(`   • Score: ${template.quality_score.score}`);
      console.log(`   • Date: ${template.quality_score.date}`);
    }

    // Components
    console.log('\n🧩 Components:');
    if (template.components && template.components.length > 0) {
      template.components.forEach((component, compIndex) => {
        console.log(`\n   ${compIndex + 1}. ${component.type}:`);
        
        if (component.type === 'HEADER') {
          console.log(`      • Format: ${component.format}`);
          if (component.text) {
            console.log(`      • Text: "${component.text}"`);
          }
          if (component.example && component.example.header_handle) {
            console.log(`      • Example: ${JSON.stringify(component.example.header_handle)}`);
          }
        }
        
        if (component.type === 'BODY') {
          console.log(`      • Text: "${component.text}"`);
          const variables = component.text.match(/{{[1-9][0-9]*}}/g);
          if (variables) {
            console.log(`      • Variables: ${variables.join(', ')}`);
          }
          if (component.example && component.example.body_text) {
            console.log(`      • Example Values:`);
            component.example.body_text[0].forEach((val, idx) => {
              console.log(`         {{${idx + 1}}}: "${val}"`);
            });
          }
        }
        
        if (component.type === 'FOOTER') {
          console.log(`      • Text: "${component.text}"`);
        }
        
        if (component.type === 'BUTTONS') {
          console.log(`      • Buttons (${component.buttons.length}):`);
          component.buttons.forEach((btn, btnIdx) => {
            console.log(`         ${btnIdx + 1}. Type: ${btn.type}`);
            console.log(`            Text: "${btn.text}"`);
            if (btn.url) console.log(`            URL: ${btn.url}`);
            if (btn.phone_number) console.log(`            Phone: ${btn.phone_number}`);
          });
        }
      });
    } else {
      console.log('   ⚠️  No components found');
    }

    // Raw JSON for reference
    console.log('\n📄 Raw Template JSON:');
    console.log(JSON.stringify(template, null, 2));
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ END OF TEMPLATE DETAILS');
  console.log('='.repeat(80) + '\n');
};

export async function GET() {
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

    log('Fetching template list', { wabaId: WABA_ID });
    
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    );
    
    log('Templates fetched successfully', { 
      count: response.data.data.length,
      hasNextPage: !!response.data.paging?.next 
    });

    // Log detailed template information
    if (response.data.data && response.data.data.length > 0) {
      logTemplateDetails(response.data.data);
    } else {
      console.log('⚠️  No templates found in response');
    }

    // Log the complete response structure
    console.log('\n📦 Complete API Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorDetails = error.response
      ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        }
      : { 
          message: error.message, 
          stack: error.stack 
        };
    
    console.error('\n' + '❌'.repeat(40));
    console.error('ERROR FETCHING TEMPLATES');
    console.error('❌'.repeat(40));
    log('Error fetching templates', errorDetails);
    console.error(JSON.stringify(errorDetails, null, 2));
    console.error('❌'.repeat(40) + '\n');
    
    return new Response(
      JSON.stringify({ error: error.response ? error.response.data.error?.message : 'Failed to list templates' }),
      {
        status: error.response ? error.response.status : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
