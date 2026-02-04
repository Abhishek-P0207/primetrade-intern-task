import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users/[id]/tasks - Get all tasks for a specific user
export const GET = requireAdmin(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Build where clause
      const where: any = { userId: id };
      if (status) {
        where.status = status;
      }

      // Get tasks
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ tasks });
    } catch (error) {
      console.error('Get user tasks error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);
