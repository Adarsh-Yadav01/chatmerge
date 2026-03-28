import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next'; // Added for session management
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path to your NextAuth config

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: GET Keyword Automations ---');
    console.log('Server session:', session); // Log full session
    console.log('Server session user.id:', session?.user?.id, typeof session?.user?.id); // Type!

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user.id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    const where = {
      userId: session.user.id, // Filter by userId
      ...(isActive !== null && { isActive: isActive === 'true' }),
    };

    const automations = await prisma.keywordAutomation.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: automations });
  } catch (error) {
    console.error('Error fetching keyword automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keyword automations' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: POST Keyword Automation ---');
    console.log('Server session:', session); // Log full session
    console.log('Server session user.id:', session?.user?.id, typeof session?.user?.id); // Type!

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user.id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received request body:', body); // Full body

    const {
      keyword,
      matchType = 'exact',
      templateId,
      templateName,
      language,
      parameters,
      isActive = true,
      priority = 0,
    } = body;

    if (!keyword || !templateId || !templateName || !language) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: keyword, templateId, templateName, language' },
        { status: 400 }
      );
    }

    const validMatchTypes = ['exact', 'contains', 'startsWith', 'endsWith'];
    if (!validMatchTypes.includes(matchType)) {
      console.log('Invalid matchType:', matchType);
      return NextResponse.json(
        { error: `Invalid matchType. Must be one of: ${validMatchTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      console.log('User not found for userId:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const automation = await prisma.keywordAutomation.create({
      data: {
        keyword: keyword.toLowerCase().trim(),
        matchType,
        templateId,
        templateName,
        language,
        parameters: parameters ? JSON.stringify(parameters) : null,
        isActive,
        priority,
        userId: session.user.id, // Set from session
      },
    });

    console.log('Created automation:', automation);

    return NextResponse.json({
      success: true,
      message: 'Keyword automation created successfully',
      data: automation,
    });
  } catch (error) {
    console.error('Error creating keyword automation:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword automation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: PUT Keyword Automation ---');
    console.log('Server session:', session); // Log full session
    console.log('Server session user.id:', session?.user?.id, typeof session?.user?.id); // Type!

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user.id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received request body:', body); // Full body

    const { id, userId, ...updateData } = body;

    if (!id) {
      console.log('Automation ID is required');
      return NextResponse.json(
        { error: 'Automation ID is required' },
        { status: 400 }
      );
    }

    // Verify the automation belongs to the user
    const existingAutomation = await prisma.keywordAutomation.findUnique({
      where: { id },
    });
    console.log('Existing automation:', existingAutomation);
    if (!existingAutomation || existingAutomation.userId !== session.user.id) {
      console.log('Unauthorized: Automation not found or does not belong to user');
      return NextResponse.json(
        { error: 'Unauthorized: Automation not found or does not belong to user' },
        { status: 403 }
      );
    }

    const data = {};
    if (updateData.keyword) data.keyword = updateData.keyword.toLowerCase().trim();
    if (updateData.matchType) data.matchType = updateData.matchType;
    if (updateData.templateId) data.templateId = updateData.templateId;
    if (updateData.templateName) data.templateName = updateData.templateName;
    if (updateData.language) data.language = updateData.language;
    if (updateData.parameters !== undefined) {
      data.parameters = updateData.parameters ? JSON.stringify(updateData.parameters) : null;
    }
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.priority !== undefined) data.priority = updateData.priority;

    const automation = await prisma.keywordAutomation.update({
      where: { id },
      data,
    });

    console.log('Updated automation:', automation);

    return NextResponse.json({
      success: true,
      message: 'Keyword automation updated successfully',
      data: automation,
    });
  } catch (error) {
    console.error('Error updating keyword automation:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword automation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('--- Backend Debug: DELETE Keyword Automation ---');
    console.log('Server session:', session); // Log full session
    console.log('Server session user.id:', session?.user?.id, typeof session?.user?.id); // Type!

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user.id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('Automation ID is required');
      return NextResponse.json(
        { error: 'Automation ID is required' },
        { status: 400 }
      );
    }

    // Verify the automation belongs to the user
    const existingAutomation = await prisma.keywordAutomation.findUnique({
      where: { id },
    });
    console.log('Existing automation:', existingAutomation);
    if (!existingAutomation || existingAutomation.userId !== session.user.id) {
      console.log('Unauthorized: Automation not found or does not belong to user');
      return NextResponse.json(
        { error: 'Unauthorized: Automation not found or does not belong to user' },
        { status: 403 }
      );
    }

    await prisma.keywordAutomation.delete({
      where: { id },
    });

    console.log('Deleted automation with id:', id);

    return NextResponse.json({
      success: true,
      message: 'Keyword automation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting keyword automation:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword automation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}