import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/regions/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const region = await prisma.region.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            athletes: true,
            coaches: true,
            judges: true,
          },
        },
      },
    });

    if (!region) {
      return errorResponse('Region not found', 404);
    }

    return successResponse(region);
  } catch (error) {
    console.error('Region GET error:', error);
    return errorResponse('Failed to fetch region', 500);
  }
}

// PATCH /api/regions/[id] - Protected (Admin/Editor)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const region = await prisma.region.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameKk !== undefined && { nameKk: body.nameKk }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
        ...(body.director !== undefined && { director: body.director }),
        ...(body.directorKk !== undefined && { directorKk: body.directorKk }),
        ...(body.directorEn !== undefined && { directorEn: body.directorEn }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.addressKk !== undefined && { addressKk: body.addressKk }),
        ...(body.addressEn !== undefined && { addressEn: body.addressEn }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return successResponse(region);
  } catch (error) {
    console.error('Region PATCH error:', error);
    return errorResponse('Failed to update region', 500);
  }
}

// DELETE /api/regions/[id] - Protected (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;

    // Check if region has associated records
    const region = await prisma.region.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            athletes: true,
            coaches: true,
            judges: true,
            users: true,
          },
        },
      },
    });

    if (!region) {
      return errorResponse('Region not found', 404);
    }

    const totalRelated =
      region._count.athletes +
      region._count.coaches +
      region._count.judges +
      region._count.users;

    if (totalRelated > 0) {
      return errorResponse(
        `Cannot delete region with ${totalRelated} associated records. Please reassign or delete them first.`,
        400
      );
    }

    await prisma.region.delete({
      where: { id: parseInt(id) },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Region DELETE error:', error);
    return errorResponse('Failed to delete region', 500);
  }
}
