import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/staff/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return errorResponse('Staff member not found', 404);
    }

    return successResponse(staff);
  } catch (error) {
    return errorResponse('Failed to fetch staff member', 500);
  }
}

// PATCH /api/staff/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const staffId = parseInt(id);
    const body = await request.json();

    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: body,
    });

    return successResponse(staff);
  } catch (error) {
    return errorResponse('Failed to update staff member', 500);
  }
}

// DELETE /api/staff/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const staffId = parseInt(id);

    await prisma.staff.delete({
      where: { id: staffId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete staff member', 500);
  }
}
