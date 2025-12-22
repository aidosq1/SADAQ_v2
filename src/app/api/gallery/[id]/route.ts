import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/gallery/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);

    const item = await prisma.galleryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return errorResponse('Gallery item not found', 404);
    }

    return successResponse(item);
  } catch (error) {
    return errorResponse('Failed to fetch gallery item', 500);
  }
}

// PATCH /api/gallery/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const itemId = parseInt(id);
    const body = await request.json();

    // Handle eventDate conversion
    if (body.eventDate) {
      body.eventDate = new Date(body.eventDate);
    }

    const item = await prisma.galleryItem.update({
      where: { id: itemId },
      data: body,
    });

    return successResponse(item);
  } catch (error) {
    return errorResponse('Failed to update gallery item', 500);
  }
}

// DELETE /api/gallery/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const itemId = parseInt(id);

    await prisma.galleryItem.delete({
      where: { id: itemId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete gallery item', 500);
  }
}
