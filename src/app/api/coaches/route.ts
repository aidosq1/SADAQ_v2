import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion, parseQueryParams } from '@/lib/api-utils';

// GET /api/coaches - Public or filtered for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const isActive = searchParams.get('isActive');
    const forAdmin = searchParams.get('admin') === 'true';
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where: Record<string, unknown> = {
      ...(regionId && { regionId: parseInt(regionId) }),
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    // For admin view, filter by region for RegionalRepresentative
    if (forAdmin) {
      const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
      if (!auth.authorized) return auth.error;

      if (auth.userRegionId) {
        where.regionId = auth.userRegionId;
      }
    }

    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip,
        include: {
          region: true,
        },
      }),
      prisma.coach.count({ where }),
    ]);

    return successResponse(coaches, { total, page, limit });
  } catch (error) {
    console.error('Coaches API error:', error);
    return errorResponse('Failed to fetch coaches', 500);
  }
}

// POST /api/coaches - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    let {
      name, nameKk, nameEn,
      iin, dob,
      regionId,
      image,
      isActive, sortOrder
    } = body;

    // For RegionalRepresentative, force their region
    if (auth.userRegionId) {
      regionId = auth.userRegionId;
    }

    if (!name) {
      return errorResponse('Name is required');
    }

    const coach = await prisma.coach.create({
      data: {
        name,
        nameKk: nameKk || null,
        nameEn: nameEn || null,
        iin: iin || null,
        dob: dob || null,
        regionId: regionId ? (typeof regionId === 'string' ? parseInt(regionId) : regionId) : null,
        image: image || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        region: true,
      },
    });

    return successResponse(coach);
  } catch (error) {
    console.error('Coach create error:', error);
    return errorResponse('Failed to create coach', 500);
  }
}
