import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/history/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    const event = await prisma.historyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return errorResponse('History event not found', 404);
    }

    return successResponse(event);
  } catch (error) {
    return errorResponse('Failed to fetch history event', 500);
  }
}

// PATCH /api/history/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const eventId = parseInt(id);
    const body = await request.json();

    const event = await prisma.historyEvent.update({
      where: { id: eventId },
      data: body,
    });

    return successResponse(event);
  } catch (error) {
    return errorResponse('Failed to update history event', 500);
  }
}

// DELETE /api/history/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const eventId = parseInt(id);

    await prisma.historyEvent.delete({
      where: { id: eventId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete history event', 500);
  }
}
