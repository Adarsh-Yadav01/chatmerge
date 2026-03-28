// app/api/comments/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    // Convert BigInt to string to avoid serialization issues
    const safeComments = comments.map(comment => ({
      ...comment,
      user: comment.user ? {
        ...comment.user,
        instagramUserId: comment.user.instagramUserId?.toString() || null,
      } : null,
    }));

    return NextResponse.json(safeComments);
  } catch (error) {
    console.error('Comment fetch error:', error.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}