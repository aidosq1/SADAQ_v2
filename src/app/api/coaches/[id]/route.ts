import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion } from '@/lib/api-utils';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/coaches/[id] - Public
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const coachId = parseInt(id);

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        region: true,
        athletes: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                nameKk: true,
                nameEn: true,
                slug: true,
                image: true,
                type: true,
                category: true,
                gender: true,
              },
            },
          },
        },
      },
    });

    if (!coach) {
      return errorResponse('Coach not found', 404);
    }

    return successResponse(coach);
  } catch (error) {
    return errorResponse('Failed to fetch coach', 500);
  }
}

// PATCH /api/coaches/[id] - Protected
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const coachId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingCoach = await prisma.coach.findUnique({ where: { id: coachId } });
      if (!existingCoach || existingCoach.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    const body = await request.json();

    // Extract athleteIds if provided (for managing athletes)
    const { athleteIds, ...coachData } = body;

    // Update coach basic data
    if (coachData.regionId !== undefined) {
      // For RegionalRepresentative, force their region
      if (auth.userRegionId) {
        coachData.regionId = auth.userRegionId;
      } else {
        coachData.regionId = coachData.regionId ? parseInt(coachData.regionId) : null;
      }
    }

    const coach = await prisma.coach.update({
      where: { id: coachId },
      data: coachData,
      include: {
        region: true,
        athletes: {
          include: {
            athlete: true,
          },
        },
      },
    });

    // If athleteIds provided, sync them
    if (athleteIds !== undefined) {
      // Delete existing athlete-coach relations
      await prisma.athleteCoach.deleteMany({
        where: { coachId },
      });

      // Create new relations
      if (athleteIds?.length) {
        await prisma.athleteCoach.createMany({
          data: athleteIds.map((athleteId: number, index: number) => ({
            coachId,
            athleteId,
            isPrimary: index === 0,
          })),
        });
      }

      // Fetch updated coach
      const updated = await prisma.coach.findUnique({
        where: { id: coachId },
        include: {
          region: true,
          athletes: {
            include: {
              athlete: true,
            },
          },
        },
      });

      return successResponse(updated);
    }

    return successResponse(coach);
  } catch (error) {
    console.error('Coach update error:', error);
    return errorResponse('Failed to update coach', 500);
  }
}

// DELETE /api/coaches/[id] - Protected
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const coachId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingCoach = await prisma.coach.findUnique({ where: { id: coachId } });
      if (!existingCoach || existingCoach.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    await prisma.coach.delete({
      where: { id: coachId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete coach', 500);
  }
}
