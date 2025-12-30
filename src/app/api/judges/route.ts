import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion, parseQueryParams } from '@/lib/api-utils';

// GET /api/judges - Public or filtered for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const forAdmin = searchParams.get('admin') === 'true';
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where: Record<string, unknown> = {
      ...(regionId && { regionId: parseInt(regionId) }),
      ...(category && { category }),
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

    const [judges, total] = await Promise.all([
      prisma.judge.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip,
        include: {
          region: true,
        },
      }),
      prisma.judge.count({ where }),
    ]);

    return successResponse(judges, { total, page, limit });
  } catch (error) {
    console.error('Judges API error:', error);
    return errorResponse('Failed to fetch judges', 500);
  }
}

// POST /api/judges - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    let {
      name, nameKk, nameEn,
      iin, dob,
      category, categoryKk, categoryEn,
      regionId,
      image,
      isActive, sortOrder
    } = body;

    // For RegionalRepresentative, force their region
    if (auth.userRegionId) {
      regionId = auth.userRegionId;
    }

    if (!name || !category) {
      return errorResponse('Name and category are required');
    }

    const judge = await prisma.judge.create({
      data: {
        name,
        nameKk: nameKk || null,
        nameEn: nameEn || null,
        iin: iin || null,
        dob: dob || null,
        category,
        categoryKk: categoryKk || null,
        categoryEn: categoryEn || null,
        regionId: regionId ? (typeof regionId === 'string' ? parseInt(regionId) : regionId) : null,
        image: image || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        region: true,
      },
    });

    return successResponse(judge);
  } catch (error) {
    console.error('Judge create error:', error);
    return errorResponse('Failed to create judge', 500);
  }
}
