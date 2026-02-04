import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import {
  getCachedTask,
  setCachedTask,
  invalidateTaskCache,
} from '@/lib/cache';

// GET /api/tasks/[id] - Get a specific task
export const GET = requireAuth(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      // Try cache first
      const cachedTask = await getCachedTask(id);
      if (cachedTask) {
        // Verify ownership
        if (cachedTask.userId !== user.userId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
        console.log('Cache hit: task', id);
        return NextResponse.json({ task: cachedTask, cached: true });
      }

      // Fallback to database
      console.log('Cache miss: fetching task from database');
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      if (task.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Cache for next time
      await setCachedTask(id, task);

      return NextResponse.json({ task, cached: false });
    } catch (error) {
      console.error('Get task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/tasks/[id] - Update a task
export const PATCH = requireAuth(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { title, description, status } = body;

      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      if (task.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
        },
      });

      // Invalidate cache for this task and user's task list
      await invalidateTaskCache(id, user.userId);

      return NextResponse.json({ task: updatedTask });
    } catch (error) {
      console.error('Update task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/tasks/[id] - Delete a task
export const DELETE = requireAuth(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      if (task.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      await prisma.task.delete({
        where: { id },
      });

      // Invalidate cache for this task and user's task list
      await invalidateTaskCache(id, user.userId);

      return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);
