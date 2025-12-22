import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/protocols - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const tournamentId = searchParams.get('tournamentId');
    const tournamentCategoryId = searchParams.get('tournamentCategoryId');
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      isPublished: true,
      ...(year && { year: parseInt(year) }),
      ...(tournamentId && { tournamentCategoryId: parseInt(tournamentId) }),
      ...(tournamentCategoryId && { tournamentCategoryId: parseInt(tournamentCategoryId) }),
    };

    const [protocols, total] = await Promise.all([
      prisma.protocol.findMany({
        where,
        include: {
          tournamentCategory: {
            include: {
              tournament: {
                select: { id: true, title: true, titleKk: true, titleEn: true },
              },
            },
          },
        },
        orderBy: [
          { year: 'desc' },
          { eventDate: 'desc' },
        ],
        take: limit,
        skip,
      }),
      prisma.protocol.count({ where }),
    ]);

    // Group by year for frontend convenience
    const groupedByYear = protocols.reduce((acc, protocol) => {
      const yearKey = protocol.year.toString();
      if (!acc[yearKey]) {
        acc[yearKey] = [];
      }
      acc[yearKey].push(protocol);
      return acc;
    }, {} as Record<string, typeof protocols>);

    return successResponse({ protocols, groupedByYear }, { total, page, limit });
  } catch (error) {
    return errorResponse('Failed to fetch protocols', 500);
  }
}

// POST /api/protocols - Protected (Admin/Editor)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      title, titleKk, titleEn,
      eventDate, location, locationKk, locationEn,
      fileUrl, year, sortOrder, isPublished, tournamentId, tournamentCategoryId
    } = body;

    if (!title || !eventDate || !location || !year) {
      return errorResponse('Missing required fields: title, eventDate, location, year');
    }

    const protocol = await prisma.protocol.create({
      data: {
        title,
        titleKk,
        titleEn,
        eventDate: new Date(eventDate),
        location,
        locationKk,
        locationEn,
        fileUrl,
        year: parseInt(year),
        sortOrder: sortOrder ?? 0,
        isPublished: isPublished ?? true,
        tournamentCategoryId: tournamentCategoryId ? parseInt(tournamentCategoryId) : (tournamentId ? parseInt(tournamentId) : null),
      },
    });

    return successResponse(protocol);
  } catch (error) {
    return errorResponse('Failed to create protocol', 500);
  }
}
