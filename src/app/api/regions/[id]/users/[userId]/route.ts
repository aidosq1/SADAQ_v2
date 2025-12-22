import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';

// PATCH /api/regions/[id]/users/[userId] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id, userId } = await params;
    const body = await request.json();

    // Verify user belongs to this region
    const existingUser = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
        regionId: parseInt(id),
      },
    });

    if (!existingUser) {
      return errorResponse('User not found in this region', 404);
    }

    const updateData: Record<string, unknown> = {};

    if (body.email !== undefined) {
      updateData.email = body.email;
    }

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    if (body.username && body.username !== existingUser.username) {
      // Check if new username is taken
      const taken = await prisma.user.findUnique({
        where: { username: body.username },
      });
      if (taken) {
        return errorResponse('Username already exists');
      }
      updateData.username = body.username;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('User PATCH error:', error);
    return errorResponse('Failed to update user', 500);
  }
}

// DELETE /api/regions/[id]/users/[userId] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id, userId } = await params;

    // Verify user belongs to this region
    const existingUser = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
        regionId: parseInt(id),
      },
    });

    if (!existingUser) {
      return errorResponse('User not found in this region', 404);
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
