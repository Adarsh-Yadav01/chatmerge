import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = params;

  // Check if userId exists
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

    // Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the setting exists and belongs to the user
    const existingSetting = await prisma.dmSetting.findFirst({
      where: { id, userId },
    });

    if (!existingSetting) {
      return NextResponse.json({ message: 'DM setting not found' }, { status: 404 });
    }

    const updatedSetting = await prisma.dmSetting.update({
      where: { id },
      data: {
        keywords,
        dmMessage,
        dmLink,
        dmLinkButtonLabel: dmLinkButtonLabel || 'Link',
      },
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error('Error updating DM setting:', error);
    console.error('Error details:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        message: 'User not found or invalid user reference' 
      }, { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        message: 'DM setting not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = params;

  // Check if userId exists
  if (!userId) {
    console.error('No user ID found in session:', session.user);
    return NextResponse.json({ message: 'User ID not found' }, { status: 400 });
  }

  try {
    // Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the setting exists and belongs to the user
    const existingSetting = await prisma.dmSetting.findFirst({
      where: { id, userId },
    });

    if (!existingSetting) {
      return NextResponse.json({ message: 'DM setting not found' }, { status: 404 });
    }

    await prisma.dmSetting.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'DM setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting DM setting:', error);
    console.error('Error details:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        message: 'User not found or invalid user reference' 
      }, { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        message: 'DM setting not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { id } = params;

  try {
    console.log('Searching for DM setting with ID:', id);
    const dmSetting = await prisma.dmSetting.findUnique({
      where: { id },
    });

    console.log('Found DM setting:', dmSetting);

    if (!dmSetting) {
      return NextResponse.json({ message: 'DM setting not found' }, { status: 404 });
    }

    return NextResponse.json(dmSetting);
  } catch (error) {
    console.error('Error fetching DM setting:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}