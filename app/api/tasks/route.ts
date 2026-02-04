import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import {
  getCachedTasks,
  setCachedTasks,
  invalidateTasksCache,
} from '@/lib/cache';

// GET /api/tasks - Get all tasks for the authenticated user
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // Try cache first
    const cachedTasks = await getCachedTasks(user.userId);
    if (cachedTasks) {
      console.log('Cache hit: tasks list');
      return NextResponse.json({ tasks: cachedTasks, cached: true });
    }

    // Fallback to database
    console.log('Cache miss: fetching tasks from database');
    const tasks = await prisma.task.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    // Cache for next time
    await setCachedTasks(user.userId, tasks);

    return NextResponse.json({ tasks, cached: false });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/tasks - Create a new task
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, description, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'OPEN',
        userId: user.userId,
      },
    });

    // Invalidate tasks cache since we added a new task
    await invalidateTasksCache(user.userId);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
