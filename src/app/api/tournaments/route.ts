import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';
import { getTournamentDatesError, InvalidDateError } from '@/lib/tournament-input';
import { pickTournamentFields, parseCategories, TournamentInputError } from '@/lib/tournament-write';

// GET /api/tournaments - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isRegistrationOpen = searchParams.get('isRegistrationOpen');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const gender = searchParams.get('gender');
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where: Record<string, unknown> = {};
    const now = new Date();

    // Filter by registration open status
    if (isRegistrationOpen !== null) {
      where.isRegistrationOpen = isRegistrationOpen === 'true';
    }

    // Filter by computed status (case-insensitive)
    const statusLower = status?.toLowerCase();
    if (statusLower) {
      if (statusLower === 'upcoming' || statusLower === 'registration_open') {
        // Tournaments with open registration: not started yet and deadline not passed
        where.isRegistrationOpen = true;
        where.startDate = { gt: now };
        where.OR = [
          { registrationDeadline: null },
          { registrationDeadline: { gte: now } }
        ];
      } else if (statusLower === 'in_progress') {
        // Tournaments currently happening
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else if (statusLower === 'completed') {
        // Finished tournaments
        where.endDate = { lt: now };
      }
    }

    // Filter by category attributes
    if (category || type || gender) {
      where.categories = {
        some: {
          ...(category && { category }),
          ...(type && { type }),
          ...(gender && { gender }),
        }
      };
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
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
            orderBy: [
              { category: 'asc' },
              { gender: 'asc' },
              { type: 'asc' }
            ]
          }
        },
        orderBy: { startDate: 'desc' },
        take: limit,
        skip,
      }),
      prisma.tournament.count({ where }),
    ]);

    return successResponse(tournaments, { total, page, limit });
  } catch (error) {
    console.error('Failed to fetch tournaments:', error);
    return errorResponse('Failed to fetch tournaments', 500);
  }
}

// POST /api/tournaments - Protected (Admin/Editor)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const fields = pickTournamentFields(body);
    const categories = parseCategories(body.categories ?? []);
    const { title, location, startDate, endDate } = fields;

    if (!title || !startDate || !endDate || !location) {
      return errorResponse('Missing required fields: title, startDate, endDate, location');
    }

    const datesError = getTournamentDatesError(startDate, endDate);
    if (datesError) return errorResponse(datesError);

    const tournament = await prisma.$transaction(async (tx) => {
      // Only one featured tournament at a time
      if (fields.isFeatured) {
        await tx.tournament.updateMany({
          where: { isFeatured: true },
          data: { isFeatured: false },
        });
      }

      return tx.tournament.create({
        data: {
          ...fields,
          title,
          location,
          startDate,
          endDate,
          isRegistrationOpen: fields.isRegistrationOpen ?? true,
          isFeatured: fields.isFeatured ?? false,
          categories: { create: categories },
        },
        include: {
          organizingRegion: true,
          categories: true
        }
      });
    });

    return successResponse(tournament);
  } catch (error) {
    if (error instanceof TournamentInputError || error instanceof InvalidDateError) {
      return errorResponse(error.message);
    }
    console.error('Failed to create tournament:', error);
    return errorResponse('Failed to create tournament', 500);
  }
}
