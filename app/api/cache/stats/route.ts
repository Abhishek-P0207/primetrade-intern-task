import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { getCacheStats } from '@/lib/cache';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // Only allow admins to view cache stats
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const stats = await getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
