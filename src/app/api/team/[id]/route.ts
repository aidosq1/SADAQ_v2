import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion } from '@/lib/api-utils';

// GET /api/team/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const athleteId = parseInt(id);

    const include = {
      rankings: {
        orderBy: { points: 'desc' as const },
      },
      nationalTeamMemberships: {
        where: { isActive: true },
      },
      regionRef: true,
      coach: true,
    };

    if (isNaN(athleteId)) {
      // Try to find by slug
      const athlete = await prisma.athlete.findUnique({
        where: { slug: id },
        include,
      });
      if (!athlete) {
        return errorResponse('Athlete not found', 404);
      }
      return successResponse(athlete);
    }

    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include,
    });

    if (!athlete) {
      return errorResponse('Athlete not found', 404);
    }

    return successResponse(athlete);
  } catch (error) {
    return errorResponse('Failed to fetch athlete', 500);
  }
}

// PATCH /api/team/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const athleteId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingAthlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
      if (!existingAthlete || existingAthlete.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    const body = await request.json();

    // Extract nationalTeamMemberships if provided
    let { nationalTeamMemberships, regionId, ...athleteData } = body;

    // For RegionalRepresentative, force their region
    if (auth.userRegionId) {
      regionId = auth.userRegionId;
    }

    // Add regionId back to athleteData if provided
    if (regionId !== undefined) {
      athleteData.regionId = regionId;
    }

    // Convert date fields
    if (athleteData.registrationDate !== undefined) {
      athleteData.registrationDate = athleteData.registrationDate ? new Date(athleteData.registrationDate) : null;
    }
    if (athleteData.sportsRankDate !== undefined) {
      athleteData.sportsRankDate = athleteData.sportsRankDate ? new Date(athleteData.sportsRankDate) : null;
    }
    if (athleteData.medicalDate !== undefined) {
      athleteData.medicalDate = athleteData.medicalDate ? new Date(athleteData.medicalDate) : null;
    }
    if (athleteData.medicalExpiry !== undefined) {
      athleteData.medicalExpiry = athleteData.medicalExpiry ? new Date(athleteData.medicalExpiry) : null;
    }

    // Convert coachId to integer
    if (athleteData.coachId !== undefined) {
      athleteData.coachId = athleteData.coachId ? parseInt(athleteData.coachId) : null;
    }

    // Update athlete data
    const athlete = await prisma.athlete.update({
      where: { id: athleteId },
      data: athleteData,
      include: {
        nationalTeamMemberships: true,
        regionRef: true,
        coach: true,
      },
    });

    // If nationalTeamMemberships provided, sync them
    if (nationalTeamMemberships !== undefined) {
      await prisma.nationalTeamMembership.deleteMany({
        where: { athleteId },
      });

      if (nationalTeamMemberships?.length) {
        await prisma.nationalTeamMembership.createMany({
          data: nationalTeamMemberships.map((m: { category: string; gender: string; type: string }) => ({
            athleteId,
            category: m.category,
            gender: m.gender,
            type: m.type,
          })),
        });
      }
    }

    // Fetch updated athlete with all relations
    const updated = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        nationalTeamMemberships: true,
        regionRef: true,
        coach: true,
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Update athlete error:', error);
    return errorResponse('Failed to update athlete', 500);
  }
}

// DELETE /api/team/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const athleteId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingAthlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
      if (!existingAthlete || existingAthlete.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    await prisma.athlete.delete({
      where: { id: athleteId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete athlete', 500);
  }
}
