// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(request) {
//   try {
//     console.log('--- Public API: GET All Message Statuses ---');

//     // Parse pagination params
//     const { searchParams } = new URL(request.url);
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const page = parseInt(searchParams.get('page') || '1');
//     const skip = (page - 1) * limit;

//     // Fetch message statuses directly (no auth)
//     const statuses = await prisma.messageStatus.findMany({
//       orderBy: { timestamp: 'desc' },
//       take: limit,
//       skip,
//       select: {
//         id: true,
//         messageId: true,
//         recipientPhone: true,
//         status: true,
//         timestamp: true,
//         error: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     // Count total
//     const total = await prisma.messageStatus.count();

//     console.log(`Fetched ${statuses.length} public message statuses`);

//     return NextResponse.json({
//       success: true,
//       data: statuses,
//       total,
//       page,
//       limit,
//     });
//   } catch (error) {
//     console.error('Error fetching all message statuses:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch all message statuses' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }


import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log('--- Public API: GET All Message Statuses (with filters) ---');

    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Filters
    const phone = searchParams.get('phone');       // filter by recipientPhone
    const messageId = searchParams.get('messageId'); // filter by messageId
    const statusFilter = searchParams.get('status'); // filter by status

    // Build dynamic Prisma query
    const where = {};
    if (phone) where.recipientPhone = phone;
    if (messageId) where.messageId = messageId;
    if (statusFilter) where.status = statusFilter;

    // Fetch filtered data
    const statuses = await prisma.messageStatus.findMany({
      where,
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

    // Get total count
    const total = await prisma.messageStatus.count({ where });

    console.log(`Fetched ${statuses.length} statuses (filters:`, where, ')');

    return NextResponse.json({
      success: true,
      filters: where,
      data: statuses,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching all message statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message statuses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
