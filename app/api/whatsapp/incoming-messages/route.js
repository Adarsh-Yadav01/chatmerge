import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: GET Incoming Messages ---');
    console.log('Server session:', session);
    console.log('Server session user.id:', session?.user?.id, typeof session?.user?.id);

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user.id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { whatsappPhoneId: true },
    });

    if (!user?.whatsappPhoneId) {
      console.log('No WhatsApp phone ID configured for user:', session.user.id);
      return NextResponse.json({ error: 'No WhatsApp phone ID configured' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const messages = await prisma.incomingMessage.findMany({
      where: { phoneNumberId: user.whatsappPhoneId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        messageId: true,
        fromPhone: true,
        messageType: true,
        textBody: true,
        phoneNumberId: true,
        timestamp: true,
        createdAt: true,
      },
    });

    const total = await prisma.incomingMessage.count({
      where: { phoneNumberId: user.whatsappPhoneId },
    });

    console.log(`Fetched ${messages.length} incoming messages for user:`, session.user.id);

    return NextResponse.json({
      success: true,
      data: messages,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching incoming messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incoming messages' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}