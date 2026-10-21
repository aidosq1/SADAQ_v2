import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';
import { PUBLIC_REGION_SELECT } from '@/lib/public-selects';
import { getTournamentDatesError, InvalidDateError } from '@/lib/tournament-input';
import {
  pickTournamentFields,
  parseCategories,
  deleteCategories,
  isSameCategory,
  TournamentInputError,
  TournamentConflictError,
} from '@/lib/tournament-write';

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
        organizingRegion: {
          select: {
            id: true,
            name: true,
            nameKk: true,
            nameEn: true,
            address: true,
            addressKk: true,
            addressEn: true,
            phone: true,
            email: true
          }
        },
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
                    regionRef: { select: PUBLIC_REGION_SELECT }
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
    if (isNaN(tournamentId)) {
      return errorResponse('Invalid tournament ID', 400);
    }

    const body = await request.json();
    const fields = pickTournamentFields(body);
    const categories = body.categories === undefined ? undefined : parseCategories(body.categories);

    const existing = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { categories: true }
    });
    if (!existing) {
      return errorResponse('Tournament not found', 404);
    }

    const datesError = getTournamentDatesError(
      fields.startDate ?? existing.startDate,
      fields.endDate ?? existing.endDate
    );
    if (datesError) return errorResponse(datesError);

    const tournament = await prisma.$transaction(async (tx) => {
      // Only one featured tournament at a time
      if (fields.isFeatured === true) {
        await tx.tournament.updateMany({
          where: { isFeatured: true, id: { not: tournamentId } },
          data: { isFeatured: false },
        });
      }

      // Keep existing category IDs: registrations and results are linked to them
      if (categories !== undefined) {
        const removed = existing.categories.filter((e) => !categories.some((c) => isSameCategory(c, e)));
        const added = categories.filter((c) => !existing.categories.some((e) => isSameCategory(c, e)));

        await deleteCategories(tx, removed.map((c) => c.id));
        if (added.length > 0) {
          await tx.tournamentCategory.createMany({
            data: added.map((c) => ({ tournamentId, ...c }))
          });
        }
      }

      return tx.tournament.update({
        where: { id: tournamentId },
        data: fields,
        include: { organizingRegion: true, categories: true }
      });
    });

    return successResponse(tournament);
  } catch (error) {
    if (error instanceof TournamentInputError || error instanceof InvalidDateError) {
      return errorResponse(error.message);
    }
    if (error instanceof TournamentConflictError) {
      return errorResponse(`Нельзя удалить категорию. ${error.message}`, 409);
    }
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
    if (isNaN(tournamentId)) {
      return errorResponse('Invalid tournament ID', 400);
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { categories: { select: { id: true } } }
    });
    if (!tournament) {
      return errorResponse('Tournament not found', 404);
    }

    // Registrations would otherwise lose their tournament and results would vanish silently
    await prisma.$transaction(async (tx) => {
      await deleteCategories(tx, tournament.categories.map((c) => c.id));
      await tx.tournament.delete({ where: { id: tournamentId } });
    });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof TournamentConflictError) {
      return errorResponse(`Нельзя удалить турнир. ${error.message}`, 409);
    }
    console.error('Failed to delete tournament:', error);
    return errorResponse('Failed to delete tournament', 500);
  }
}
