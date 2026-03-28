
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { decode } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(req) {
  // Log the incoming request
  const body = await req.json();
  console.log('update-user: Received request:', JSON.stringify(body, null, 2));
  
  // Log cookies for debugging
  const cookies = req.headers.get('cookie') || 'No cookies received';
  console.log('update-user: Request cookies:', cookies);
  
  // Get session
  try {
    let session = await getServerSession(authOptions);
    console.log('update-user: Session from getServerSession:', JSON.stringify(session, null, 2));

    // If session is incomplete or not from WhatsApp provider, try decoding the session token
    if (!session || !session.user?.id || session.user?.provider !== 'whatsapp') {
      console.log('update-user: Session invalid or not WhatsApp provider, attempting to decode session token');
      const sessionToken = cookies
        .split('; ')
        .find(cookie => cookie.startsWith('__Secure-next-auth.session-token='))
        ?.split('=')[1];
      
      if (sessionToken) {
        try {
          const decoded = await decode({
            token: sessionToken,
            secret: process.env.NEXTAUTH_SECRET,
          });
          console.log('update-user: Decoded session token:', JSON.stringify({
            ...decoded,
            whatsappToken: decoded.whatsappToken ? '[REDACTED]' : null,
          }, null, 2));
          
          // Reconstruct session object
          session = {
            user: {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              image: decoded.picture,
              role: decoded.role,
              provider: decoded.provider || 'whatsapp', // Assume WhatsApp if provider is not set
              instagramUserId: decoded.instagramUserId,
              instagramToken: decoded.instagramToken,
              whatsappWabaId: decoded.whatsappWabaId,
              whatsappPhoneId: decoded.whatsappPhoneId,
              whatsappToken: decoded.whatsappToken,
            },
            expires: new Date(decoded.exp * 1000).toISOString(),
          };
          console.log('update-user: Reconstructed session:', JSON.stringify({
            ...session,
            user: {
              ...session.user,
              whatsappToken: session.user.whatsappToken ? '[REDACTED]' : null,
            },
          }, null, 2));
        } catch (decodeError) {
          console.error('update-user: Failed to decode session token:', decodeError.message);
        }
      }
    }

    if (!session || !session.user?.id || session.user?.provider !== 'whatsapp') {
      console.error('update-user: No valid WhatsApp session or user ID', {
        sessionExists: !!session,
        userExists: !!session?.user,
        userIdExists: !!session?.user?.id,
        provider: session?.user?.provider,
        cookies,
      });
      return new Response(JSON.stringify({ error: 'Unauthorized: No valid WhatsApp session or user ID' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { userId, whatsappWabaId, whatsappPhoneId, whatsappToken } = body;
    console.log('update-user: Validating userId:', { userId, sessionUserId: session.user.id });

    if (session.user.id !== userId) {
      console.error('update-user: User ID mismatch:', { userId, sessionUserId: session.user.id });
      return new Response(JSON.stringify({ error: 'Unauthorized: User ID mismatch' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) {
      console.error('update-user: User not found in database:', { userId });
      return new Response(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        whatsappWabaId,
        whatsappPhoneId,
        whatsappToken,
      },
    });
    console.log('update-user: User updated successfully:', JSON.stringify({
      id: updatedUser.id,
      whatsappWabaId: updatedUser.whatsappWabaId,
      whatsappPhoneId: updatedUser.whatsappPhoneId,
      whatsappToken: '[REDACTED]'
    }, null, 2));
    return new Response(JSON.stringify({ success: true, user: {
      id: updatedUser.id,
      whatsappWabaId: updatedUser.whatsappWabaId,
      whatsappPhoneId: updatedUser.whatsappPhoneId,
      // Do not return whatsappToken to client
    } }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('update-user: Error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Failed to update user data' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
