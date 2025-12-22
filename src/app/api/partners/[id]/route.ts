import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/partners/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return errorResponse('Partner not found', 404);
    }

    return successResponse(partner);
  } catch (error) {
    return errorResponse('Failed to fetch partner', 500);
  }
}

// PATCH /api/partners/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const partnerId = parseInt(id);
    const body = await request.json();

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: body,
    });

    return successResponse(partner);
  } catch (error) {
    return errorResponse('Failed to update partner', 500);
  }
}

// DELETE /api/partners/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const partnerId = parseInt(id);

    await prisma.partner.delete({
      where: { id: partnerId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete partner', 500);
  }
}
