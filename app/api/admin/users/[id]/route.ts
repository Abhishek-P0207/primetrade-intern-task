import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { invalidateUserCache, revokeAllUserSessions } from '@/lib/cache';

// GET /api/admin/users/[id] - Get user details
export const GET = requireAdmin(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      const userData = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { tasks: true },
          },
        },
      });

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ user: userData });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/admin/users/[id] - Update user
export const PATCH = requireAdmin(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { name, role, email } = body;

      // Prevent admin from demoting themselves
      if (id === user.userId && role === 'USER') {
        return NextResponse.json(
          { error: 'Cannot demote yourself from admin' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if email is already taken by another user
      if (email && email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email },
        });

        if (emailTaken) {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 409 }
          );
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(email !== undefined && { email }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Invalidate user cache
      await invalidateUserCache(id);

      // If role changed, revoke all sessions to force re-login
      if (role !== undefined && role !== existingUser.role) {
        await revokeAllUserSessions(id);
      }

      return NextResponse.json({
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = requireAdmin(
  async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;

      // Prevent admin from deleting themselves
      if (id === user.userId) {
        return NextResponse.json(
          { error: 'Cannot delete yourself' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Delete user (tasks will be cascade deleted)
      await prisma.user.delete({
        where: { id },
      });

      // Clean up cache and sessions
      await invalidateUserCache(id);
      await revokeAllUserSessions(id);

      return NextResponse.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);
