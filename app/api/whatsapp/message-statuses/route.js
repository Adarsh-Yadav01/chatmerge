import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: GET Message Statuses ---');
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
      select: { fromPhone: true },
    });
    const recipientPhones = messages.map((m) => m.fromPhone);

    const statuses = await prisma.messageStatus.findMany({
      where: {
        recipientPhone: { in: recipientPhones },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        messageId: true,
        recipientPhone: true,
        status: true,
        timestamp: true,
        error: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.messageStatus.count({
      where: { recipientPhone: { in: recipientPhones } },
    });

    console.log(`Fetched ${statuses.length} message statuses for user:`, session.user.id);

    return NextResponse.json({
      success: true,
      data: statuses,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching message statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message statuses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}