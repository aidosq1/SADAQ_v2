import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/rankings/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rankingId = parseInt(id);

    const ranking = await prisma.rankingEntry.findUnique({
      where: { id: rankingId },
      include: {
        athlete: true,
      },
    });

    if (!ranking) {
      return errorResponse('Ranking not found', 404);
    }

    return successResponse(ranking);
  } catch (error) {
    return errorResponse('Failed to fetch ranking', 500);
  }
}

// PATCH /api/rankings/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const rankingId = parseInt(id);
    const body = await request.json();

    const ranking = await prisma.rankingEntry.update({
      where: { id: rankingId },
      data: body,
      include: {
        athlete: true,
      },
    });

    return successResponse(ranking);
  } catch (error) {
    return errorResponse('Failed to update ranking', 500);
  }
}

// DELETE /api/rankings/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const rankingId = parseInt(id);

    await prisma.rankingEntry.delete({
      where: { id: rankingId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete ranking', 500);
  }
}
