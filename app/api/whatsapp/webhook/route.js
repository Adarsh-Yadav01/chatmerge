import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log(`[${new Date().toISOString()}] GET webhook called`);
  
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log(`[${new Date().toISOString()}] GET params - mode: ${mode}, token: ${token}, challenge: ${challenge}`);

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
    console.log(`[${new Date().toISOString()}] Webhook verification successful, returning challenge`);
    return new NextResponse(challenge, { status: 200 });
  }

  console.log(`[${new Date().toISOString()}] Webhook verification failed: Invalid token or mode`);
  return NextResponse.json({ error: 'Invalid webhook verification' }, { status: 403 });
}

export async function POST(request) {
  console.log(`[${new Date().toISOString()}] POST webhook called`);

  try {
    const payload = await request.json();
    console.log(`[${new Date().toISOString()}] Received payload:`, JSON.stringify(payload, null, 2));

    const { object, entry } = payload;

    if (object !== 'whatsapp_business_account') {
      console.log(`[${new Date().toISOString()}] Invalid object type: ${object}`);
      return NextResponse.json({ error: 'Invalid object type' }, { status: 400 });
    }

    for (const entryItem of entry) {
      console.log(`[${new Date().toISOString()}] Processing entry:`, JSON.stringify(entryItem, null, 2));
      for (const change of entryItem.changes) {
        const { field, value } = change;
        console.log(`[${new Date().toISOString()}] Processing change - field: ${field}`);

        if (field === 'account_update') {
          const { waba_id, phone_number_id } = value;
          console.log(`[${new Date().toISOString()}] Account update - waba_id: ${waba_id}, phone_number_id: ${phone_number_id}`);
          if (waba_id && phone_number_id) {
            console.log(`[${new Date().toISOString()}] Updating user with waba_id: ${waba_id}`);
            await prisma.user.updateMany({
              where: { whatsappWabaId: waba_id },
              data: { whatsappPhoneId: phone_number_id },
            });
            console.log(`[${new Date().toISOString()}] User update completed for waba_id: ${waba_id}`);
          }
        } else if (field === 'messages') {
          const { metadata, contacts, messages, statuses } = value;
          console.log(`[${new Date().toISOString()}] Processing messages - phone_number_id: ${metadata?.phone_number_id}, message count: ${messages?.length || 0}`);
          
          // Handle message status updates
          if (statuses && statuses.length > 0) {
            console.log(`[${new Date().toISOString()}] Processing status updates - count: ${statuses.length}`);
            
            for (const status of statuses) {
              const { id, status: messageStatus, timestamp, recipient_id, errors } = status;
              
              console.log(`[${new Date().toISOString()}] Message status update - messageId: ${id}, status: ${messageStatus}, recipient: ${recipient_id}`);

              try {
                await prisma.messageStatus.upsert({
                  where: { messageId: id },
                  update: {
                    status: messageStatus,
                    timestamp: new Date(parseInt(timestamp) * 1000),
                    error: errors ? JSON.stringify(errors) : null,
                    updatedAt: new Date()
                  },
                  create: {
                    messageId: id,
                    recipientPhone: recipient_id,
                    status: messageStatus,
                    timestamp: new Date(parseInt(timestamp) * 1000),
                    error: errors ? JSON.stringify(errors) : null,
                  }
                });

                console.log(`[${new Date().toISOString()}] Message status saved to database - messageId: ${id}, status: ${messageStatus}`);
              } catch (dbError) {
                console.error(`[${new Date().toISOString()}] Database error while saving message status:`, dbError.message);
              }
            }
          }

          // Handle incoming messages
          if (messages && messages.length > 0) {
            for (const message of messages) {
              const from = message.from;
              const text = message.text?.body;
              const messageId = message.id;
              
              console.log(`[${new Date().toISOString()}] Incoming message from: ${from}, text: ${text || 'N/A'}, messageId: ${messageId}`);

              // Store incoming message in database
              try {
                await prisma.incomingMessage.create({
                  data: {
                    messageId,
                    fromPhone: from,
                    messageType: message.type,
                    textBody: text,
                    timestamp: new Date(parseInt(message.timestamp) * 1000),
                    phoneNumberId: metadata.phone_number_id
                  }
                });
                console.log(`[${new Date().toISOString()}] Incoming message saved to database - messageId: ${messageId}`);
              } catch (dbError) {
                console.error(`[${new Date().toISOString()}] Database error while saving incoming message:`, dbError.message);
              }

              // Keyword-based automation
              if (text) {
                console.log(`[${new Date().toISOString()}] Looking up user for phone_number_id: ${metadata.phone_number_id}`);
                const user = await prisma.user.findFirst({
                  where: { whatsappPhoneId: metadata.phone_number_id },
                });
                console.log(`[${new Date().toISOString()}] User lookup result: ${user ? 'Found' : 'Not found'}`);

                if (user && user.whatsappToken) {
                  // Fetch active keyword automations for this specific user
                  const automations = await prisma.keywordAutomation.findMany({
                    where: {
                      isActive: true,
                      userId: user.id, // Filter by userId
                    },
                    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
                  });

                  console.log(`[${new Date().toISOString()}] Checking keyword automations - count: ${automations.length}, user message: "${text}"`);

                  // Find matching automation
                  let matchedAutomation = null;
                  const normalizedText = text.toLowerCase().trim();

                  for (const automation of automations) {
                    const keyword = automation.keyword.toLowerCase();
                    let isMatch = false;

                    switch (automation.matchType) {
                      case 'exact':
                        isMatch = normalizedText === keyword;
                        break;
                      case 'contains':
                        isMatch = normalizedText.includes(keyword);
                        break;
                      case 'startsWith':
                        isMatch = normalizedText.startsWith(keyword);
                        break;
                      case 'endsWith':
                        isMatch = normalizedText.endsWith(keyword);
                        break;
                    }

                    if (isMatch) {
                      matchedAutomation = automation;
                      console.log(`[${new Date().toISOString()}] Keyword matched! keyword: "${automation.keyword}", matchType: ${automation.matchType}, template: ${automation.templateName}`);
                      break;
                    }
                  }

                  // Send template if keyword matched
                  if (matchedAutomation) {
                    try {
                      let parameters = {};
                      if (matchedAutomation.parameters) {
                        parameters = JSON.parse(matchedAutomation.parameters);
                      }

                      const components = [];
                      
                      if (Object.keys(parameters).length > 0) {
                        const bodyParams = Object.entries(parameters)
                          .filter(([key]) => key.startsWith('{{'))
                          .map(([_, value]) => ({
                            type: 'text',
                            text: value
                          }));

                        if (bodyParams.length > 0) {
                          components.push({
                            type: 'body',
                            parameters: bodyParams
                          });
                        }

                        if (parameters.header_url) {
                          components.push({
                            type: 'header',
                            parameters: [{
                              type: parameters.header_type || 'document',
                              [parameters.header_type || 'document']: {
                                link: parameters.header_url
                              }
                            }]
                          });
                        }
                      }

                      const payload = {
                        messaging_product: 'whatsapp',
                        to: from,
                        type: 'template',
                        template: {
                          name: matchedAutomation.templateName,
                          language: { code: matchedAutomation.language }
                        }
                      };

                      if (components.length > 0) {
                        payload.template.components = components;
                      }

                      console.log(`[${new Date().toISOString()}] Sending automated template message - to: ${from}, template: ${matchedAutomation.templateName}`);
                      console.log(`[${new Date().toISOString()}] Template payload:`, JSON.stringify(payload, null, 2));

                      const response = await fetch(
                        `https://graph.facebook.com/v23.0/${metadata.phone_number_id}/messages`,
                        {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${user.whatsappToken}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(payload),
                        }
                      );

                      const responseData = await response.json();

                      if (response.ok) {
                        console.log(`[${new Date().toISOString()}] Automated template sent successfully - messageId: ${responseData.messages?.[0]?.id}`);
                      } else {
                        console.error(`[${new Date().toISOString()}] Failed to send automated template:`, JSON.stringify(responseData, null, 2));
                      }
                    } catch (sendError) {
                      console.error(`[${new Date().toISOString()}] Error sending automated template:`, sendError.message);
                    }
                  } else {
                    console.log(`[${new Date().toISOString()}] No keyword match found for message: "${text}"`);
                    
                    console.log(`[${new Date().toISOString()}] Sending default automated reply to: ${from}`);
                    try {
                      await fetch(`https://graph.facebook.com/v23.0/${metadata.phone_number_id}/messages`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${user.whatsappToken}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          messaging_product: 'whatsapp',
                          to: from,
                          type: 'text',
                          text: { body: 'Thank you for your message! Our chatbot is here to assist you.' },
                        }),
                      });
                      console.log(`[${new Date().toISOString()}] Default automated reply sent to: ${from}`);
                    } catch (replyError) {
                      console.error(`[${new Date().toISOString()}] Error sending default reply:`, replyError.message);
                    }
                  }
                } else {
                  console.log(`[${new Date().toISOString()}] No user or token found for phone_number_id: ${metadata.phone_number_id}`);
                }
              }
            }
          }
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Webhook processing successful`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Webhook processing failed:`, error);
    return NextResponse.json({ error: `Webhook processing failed: ${error.message}` }, { status: 500 });
  } finally {
    console.log(`[${new Date().toISOString()}] Disconnecting Prisma client`);
    await prisma.$disconnect();
  }
}