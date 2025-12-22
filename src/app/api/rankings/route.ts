import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/rankings - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'Recurve'; // Recurve | Compound
    const gender = searchParams.get('gender') || 'M'; // M | F
    const category = searchParams.get('category') || 'Adults'; // Adults, Youth, etc.
    const { limit, page, skip } = parseQueryParams(searchParams);

    // Filter by category/gender/type
    const where = {
      type,
      gender,
      category,
      athlete: { isActive: true },
    };

    const [rankings, total] = await Promise.all([
      prisma.rankingEntry.findMany({
        where,
        orderBy: [
          { rank: 'asc' },
          { points: 'desc' },
        ],
        take: limit,
        skip,
        include: {
          athlete: {
            include: {
              regionRef: { select: { name: true, nameKk: true, nameEn: true } }
            }
          },
        },
      }),
      prisma.rankingEntry.count({ where }),
    ]);

    return successResponse(rankings, { total, page, limit, category, gender, type });
  } catch (error) {
    console.error('Rankings API error:', error);
    return errorResponse('Failed to fetch rankings', 500);
  }
}

// POST /api/rankings - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { athleteId, points, rank, classification, category, gender, type } = body;

    if (!athleteId || points === undefined || rank === undefined || !category || !gender || !type) {
      return errorResponse('Missing required fields: athleteId, points, rank, category, gender, type');
    }

    // Check if athlete exists
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
    });

    if (!athlete) {
      return errorResponse('Athlete not found', 404);
    }

    // Upsert ranking entry by athleteId + category + gender + type
    const ranking = await prisma.rankingEntry.upsert({
      where: {
        athleteId_category_gender_type: {
          athleteId,
          category,
          gender,
          type,
        },
      },
      update: {
        points,
        rank,
        classification,
      },
      create: {
        athleteId,
        points,
        rank,
        classification,
        category,
        gender,
        type,
      },
      include: {
        athlete: {
          include: {
            regionRef: { select: { name: true, nameKk: true, nameEn: true } }
          }
        },
      },
    });

    return successResponse(ranking);
  } catch (error) {
    return errorResponse('Failed to create ranking', 500);
  }
}
