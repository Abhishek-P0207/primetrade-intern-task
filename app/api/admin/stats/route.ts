import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats - Get system statistics
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Get user statistics
    const [
      totalUsers,
      adminUsers,
      regularUsers,
      totalTasks,
      openTasks,
      inProgressTasks,
      doneTasks,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'OPEN' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Get top users by task count
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        tasks: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: regularUsers,
        recent: recentUsers,
        topUsers: topUsers.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          taskCount: u._count.tasks,
        })),
      },
      tasks: {
        total: totalTasks,
        open: openTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
