import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

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
        // Tournaments with open registration (not started yet, or deadline not passed)
        where.isRegistrationOpen = true;
        where.endDate = { gt: now }; // Tournament not finished
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
    const {
      title, titleKk, titleEn,
      description, descriptionKk, descriptionEn,
      startDate, endDate,
      location, locationKk, locationEn,
      regulationUrl,
      isRegistrationOpen, registrationDeadline, isFeatured,
      organizingRegionId,
      categories = []
    } = body;

    if (!title || !startDate || !endDate || !location) {
      return errorResponse('Missing required fields: title, startDate, endDate, location');
    }

    // If setting as featured, unset other featured tournaments
    if (isFeatured) {
      await prisma.tournament.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        title,
        titleKk,
        titleEn,
        description,
        descriptionKk,
        descriptionEn,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        locationKk,
        locationEn,
        regulationUrl: regulationUrl || null,
        isRegistrationOpen: isRegistrationOpen ?? true,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isFeatured: isFeatured ?? false,
        organizingRegionId: organizingRegionId ? parseInt(organizingRegionId) : null,
        categories: {
          create: categories.map((cat: { category: string; gender: string; type: string }) => ({
            category: cat.category,
            gender: cat.gender,
            type: cat.type,
          }))
        }
      },
      include: {
        organizingRegion: true,
        categories: true
      }
    });

    return successResponse(tournament);
  } catch (error) {
    console.error('Failed to create tournament:', error);
    return errorResponse('Failed to create tournament', 500);
  }
}
