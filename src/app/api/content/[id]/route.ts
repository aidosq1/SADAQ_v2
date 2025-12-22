import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/content/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if id is numeric or a key string
    const isNumeric = !isNaN(parseInt(id));

    const content = isNumeric
      ? await prisma.siteContent.findUnique({ where: { id: parseInt(id) } })
      : await prisma.siteContent.findUnique({ where: { key: id } });

    if (!content) {
      return errorResponse('Content not found', 404);
    }

    return successResponse(content);
  } catch (error) {
    return errorResponse('Failed to fetch content', 500);
  }
}

// PATCH /api/content/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const contentId = parseInt(id);
    const body = await request.json();

    const content = await prisma.siteContent.update({
      where: { id: contentId },
      data: body,
    });

    return successResponse(content);
  } catch (error) {
    return errorResponse('Failed to update content', 500);
  }
}

// DELETE /api/content/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const contentId = parseInt(id);

    await prisma.siteContent.delete({
      where: { id: contentId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete content', 500);
  }
}
