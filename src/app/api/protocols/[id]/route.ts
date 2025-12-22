import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/protocols/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const protocolId = parseInt(id);

    const protocol = await prisma.protocol.findUnique({
      where: { id: protocolId },
      include: {
        tournamentCategory: {
          include: {
            tournament: {
              select: { id: true, title: true, titleKk: true, titleEn: true },
            },
          },
        },
      },
    });

    if (!protocol) {
      return errorResponse('Protocol not found', 404);
    }

    return successResponse(protocol);
  } catch (error) {
    return errorResponse('Failed to fetch protocol', 500);
  }
}

// PATCH /api/protocols/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const protocolId = parseInt(id);
    const body = await request.json();

    // Handle date and number conversions
    const data = { ...body };
    if (data.eventDate) {
      data.eventDate = new Date(data.eventDate);
    }
    if (data.year) {
      data.year = parseInt(data.year);
    }
    if (data.tournamentId !== undefined) {
      data.tournamentCategoryId = data.tournamentId ? parseInt(data.tournamentId) : null;
      delete data.tournamentId;
    }

    const protocol = await prisma.protocol.update({
      where: { id: protocolId },
      data,
    });

    return successResponse(protocol);
  } catch (error) {
    return errorResponse('Failed to update protocol', 500);
  }
}

// DELETE /api/protocols/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const protocolId = parseInt(id);

    await prisma.protocol.delete({
      where: { id: protocolId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete protocol', 500);
  }
}
