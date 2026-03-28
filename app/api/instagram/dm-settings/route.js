import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Debug: Check what's in the session
  console.log('Session user:', session.user);
  
  // Try different possible user ID properties
  const userId = session.user.id || session.user.sub || session.user.email;
  
  if (!userId) {
    console.error('No user ID found in session:', session.user);
    return NextResponse.json({ message: 'User ID not found' }, { status: 400 });
  }

  try {
    const dmSettings = await prisma.dmSetting.findMany({
      where: { userId },
      select: {
        id: true,
        keywords: true,
        dmMessage: true,
        dmLink: true,
        dmLinkButtonLabel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(dmSettings);
  } catch (error) {
    console.error('Error fetching DM settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Debug: Check what's in the session
  console.log('Session user:', session.user);
  
  // Try different possible user ID properties
  const userId = session.user.id || session.user.sub || session.user.email;
  
  if (!userId) {
    console.error('No user ID found in session:', session.user);
    return NextResponse.json({ message: 'User ID not found' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { keywords, dmMessage, dmLink, dmLinkButtonLabel } = body;

    // Validation
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0 || !dmMessage || !dmLink) {
      return NextResponse.json(
        { message: 'Keywords, DM message, and link are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(dmLink);
    } catch {
      return NextResponse.json({ message: 'Invalid DM link URL' }, { status: 400 });
    }

    // Validate message length
    if (dmMessage.length > 640) {
      return NextResponse.json(
        { message: 'DM message exceeds 640 characters' },
        { status: 400 }
      );
    }

    // Validate button label length
    if (dmLinkButtonLabel && dmLinkButtonLabel.length > 20) {
      return NextResponse.json(
        { message: 'Button label exceeds 20 characters' },
        { status: 400 }
      );
    }

    // Option 1: If your schema uses direct userId field
    const dmSetting = await prisma.dmSetting.create({
      data: {
        userId,
        keywords,
        dmMessage,
        dmLink,
        dmLinkButtonLabel: dmLinkButtonLabel || 'Link',
      },
    });

    // Option 2: If your schema requires connecting to user relation
    // Uncomment this and comment out the above if needed:
    /*
    const dmSetting = await prisma.dmSetting.create({
      data: {
        keywords,
        dmMessage,
        dmLink,
        dmLinkButtonLabel: dmLinkButtonLabel || 'Link',
        user: {
          connect: { id: userId }
        }
      },
    });
    */

    return NextResponse.json(dmSetting, { status: 201 });
  } catch (error) {
    console.error('Error creating DM setting:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}