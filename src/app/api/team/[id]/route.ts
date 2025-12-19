import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/team/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memberId = parseInt(id);

    if (isNaN(memberId)) {
      // Try to find by slug
      const member = await prisma.teamMember.findUnique({
        where: { slug: id },
        include: {
          rankings: {
            orderBy: { season: 'desc' },
          },
        },
      });
      if (!member) {
        return errorResponse('Team member not found', 404);
      }
      return successResponse(member);
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        rankings: {
          orderBy: { season: 'desc' },
        },
      },
    });

    if (!member) {
      return errorResponse('Team member not found', 404);
    }

    return successResponse(member);
  } catch (error) {
    console.error('Team GET by ID error:', error);
    return errorResponse('Failed to fetch team member', 500);
  }
}

// PATCH /api/team/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const memberId = parseInt(id);
    const body = await request.json();

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: body,
    });

    return successResponse(member);
  } catch (error) {
    console.error('Team PATCH error:', error);
    return errorResponse('Failed to update team member', 500);
  }
}

// DELETE /api/team/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const memberId = parseInt(id);

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Team DELETE error:', error);
    return errorResponse('Failed to delete team member', 500);
  }
}
