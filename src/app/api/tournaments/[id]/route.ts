import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/tournaments/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      return errorResponse('Invalid tournament ID', 400);
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        categories: {
          include: {
            protocols: true,
            results: {
              include: {
                athlete: {
                  select: {
                    id: true,
                    name: true,
                    nameKk: true,
                    nameEn: true,
                    slug: true,
                    region: true,
                    regionRef: {
                      select: { name: true }
                    }
                  }
                }
              },
              orderBy: { place: 'asc' }
            }
          },
          orderBy: [
            { category: 'asc' },
            { gender: 'asc' },
            { type: 'asc' }
          ]
        }
      }
    });

    if (!tournament) {
      return errorResponse('Tournament not found', 404);
    }

    return successResponse(tournament);
  } catch (error) {
    console.error('Failed to fetch tournament:', error);
    return errorResponse('Failed to fetch tournament', 500);
  }
}

// PATCH /api/tournaments/[id] - Protected (Admin/Editor)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const tournamentId = parseInt(id);
    const body = await request.json();

    // If setting as featured, unset other featured tournaments
    if (body.isFeatured === true) {
      await prisma.tournament.updateMany({
        where: {
          isFeatured: true,
          id: { not: tournamentId }
        },
        data: { isFeatured: false },
      });
    }

    // Separate categories from other data
    const { categories, ...tournamentData } = body;

    // Convert date strings to Date objects if present
    if (tournamentData.startDate) tournamentData.startDate = new Date(tournamentData.startDate);
    if (tournamentData.endDate) tournamentData.endDate = new Date(tournamentData.endDate);
    if (tournamentData.registrationDeadline) tournamentData.registrationDeadline = new Date(tournamentData.registrationDeadline);

    // Update tournament
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: tournamentData,
      include: { categories: true }
    });

    // If categories provided, update them smartly (preserve IDs for existing categories)
    if (categories !== undefined) {
      // Get existing categories with registration counts
      const existingCategories = await prisma.tournamentCategory.findMany({
        where: { tournamentId },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      });

      const incomingCategories = categories as { category: string; gender: string; type: string }[];

      // Find which categories to keep, create, or delete
      const categoriesToKeep: number[] = [];
      const categoriesToCreate: { category: string; gender: string; type: string }[] = [];

      for (const incoming of incomingCategories) {
        const existing = existingCategories.find(
          e => e.category === incoming.category &&
            e.gender === incoming.gender &&
            e.type === incoming.type
        );

        if (existing) {
          categoriesToKeep.push(existing.id);
        } else {
          categoriesToCreate.push(incoming);
        }
      }

      // Delete only categories that are NOT in the keep list AND have no registrations
      const categoriesToDelete = existingCategories.filter(
        e => !categoriesToKeep.includes(e.id) && e._count.registrations === 0
      );

      if (categoriesToDelete.length > 0) {
        await prisma.tournamentCategory.deleteMany({
          where: { id: { in: categoriesToDelete.map(c => c.id) } }
        });
      }

      // Create new categories
      if (categoriesToCreate.length > 0) {
        await prisma.tournamentCategory.createMany({
          data: categoriesToCreate.map(cat => ({
            tournamentId,
            category: cat.category,
            gender: cat.gender,
            type: cat.type,
          }))
        });
      }

      // Fetch updated tournament with categories
      const updatedTournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { categories: true }
      });

      return successResponse(updatedTournament);
    }

    return successResponse(tournament);
  } catch (error) {
    console.error('Failed to update tournament:', error);
    return errorResponse('Failed to update tournament', 500);
  }
}

// DELETE /api/tournaments/[id] - Protected (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const tournamentId = parseInt(id);

    await prisma.tournament.delete({
      where: { id: tournamentId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Failed to delete tournament:', error);
    return errorResponse('Failed to delete tournament', 500);
  }
}
