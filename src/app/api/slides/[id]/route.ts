import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/slides/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slideId = parseInt(id);

    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
    });

    if (!slide) {
      return errorResponse('Slide not found', 404);
    }

    return successResponse(slide);
  } catch (error) {
    console.error('Slide GET by ID error:', error);
    return errorResponse('Failed to fetch slide', 500);
  }
}

// PATCH /api/slides/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const slideId = parseInt(id);
    const body = await request.json();

    const slide = await prisma.slide.update({
      where: { id: slideId },
      data: body,
    });

    return successResponse(slide);
  } catch (error) {
    console.error('Slide PATCH error:', error);
    return errorResponse('Failed to update slide', 500);
  }
}

// DELETE /api/slides/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const slideId = parseInt(id);

    await prisma.slide.delete({
      where: { id: slideId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Slide DELETE error:', error);
    return errorResponse('Failed to delete slide', 500);
  }
}
