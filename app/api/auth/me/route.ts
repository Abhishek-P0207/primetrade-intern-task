import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { getCachedUser, setCachedUser } from '@/lib/cache';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // Try cache first
    const cachedUser = await getCachedUser(user.userId);
    if (cachedUser) {
      console.log('Cache hit: user data');
      return NextResponse.json({ user: cachedUser, cached: true });
    }

    // Fallback to database
    console.log('Cache miss: fetching from database');
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Cache for next time
    await setCachedUser(user.userId, userData);

    return NextResponse.json({ user: userData, cached: false });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
