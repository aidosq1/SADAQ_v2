import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/rankings - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || new Date().getFullYear().toString();
    const type = searchParams.get('type'); // Recurve | Compound
    const gender = searchParams.get('gender'); // M | F
    const category = searchParams.get('category'); // Adults, Youth, etc.
    const { limit, page, skip } = parseQueryParams(searchParams);

    // Build team member filter
    const teamMemberFilter = {
      isActive: true,
      ...(type && { type }),
      ...(gender && { gender }),
      ...(category && { category }),
    };

    const [rankings, total] = await Promise.all([
      prisma.rankingEntry.findMany({
        where: {
          season,
          teamMember: teamMemberFilter,
        },
        orderBy: [
          { rank: 'asc' },
          { points: 'desc' },
        ],
        take: limit,
        skip,
        include: {
          teamMember: true,
        },
      }),
      prisma.rankingEntry.count({
        where: {
          season,
          teamMember: teamMemberFilter,
        },
      }),
    ]);

    return successResponse(rankings, { total, page, limit, season });
  } catch (error) {
    console.error('Rankings GET error:', error);
    return errorResponse('Failed to fetch rankings', 500);
  }
}

// POST /api/rankings - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { teamMemberId, points, rank, previousRank, classification, season } = body;

    if (!teamMemberId || points === undefined || rank === undefined || !season) {
      return errorResponse('Missing required fields: teamMemberId, points, rank, season');
    }

    // Check if team member exists
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
    });

    if (!teamMember) {
      return errorResponse('Team member not found', 404);
    }

    // Upsert ranking entry
    const ranking = await prisma.rankingEntry.upsert({
      where: {
        teamMemberId_season: {
          teamMemberId,
          season,
        },
      },
      update: {
        points,
        rank,
        previousRank,
        classification,
      },
      create: {
        teamMemberId,
        points,
        rank,
        previousRank,
        classification,
        season,
      },
      include: {
        teamMember: true,
      },
    });

    return successResponse(ranking);
  } catch (error) {
    console.error('Rankings POST error:', error);
    return errorResponse('Failed to create ranking', 500);
  }
}
