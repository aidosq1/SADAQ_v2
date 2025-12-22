import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/stats/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const statId = parseInt(id);

    const stat = await prisma.siteStat.findUnique({
      where: { id: statId },
    });

    if (!stat) {
      return errorResponse('Stat not found', 404);
    }

    return successResponse(stat);
  } catch (error) {
    return errorResponse('Failed to fetch stat', 500);
  }
}

// PATCH /api/stats/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const statId = parseInt(id);
    const body = await request.json();

    const stat = await prisma.siteStat.update({
      where: { id: statId },
      data: body,
    });

    return successResponse(stat);
  } catch (error) {
    return errorResponse('Failed to update stat', 500);
  }
}

// DELETE /api/stats/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const statId = parseInt(id);

    await prisma.siteStat.delete({
      where: { id: statId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete stat', 500);
  }
}
