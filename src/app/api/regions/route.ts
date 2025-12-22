import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/regions - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      isActive: true,
    };

    const [regions, total] = await Promise.all([
      prisma.region.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip,
      }),
      prisma.region.count({ where }),
    ]);

    return successResponse(regions, { total, page, limit });
  } catch (error) {
    console.error('Regions GET error:', error);
    return errorResponse('Failed to fetch regions', 500);
  }
}

// POST /api/regions - Protected (Admin/Editor)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      name, nameKk, nameEn,
      director, directorKk, directorEn,
      address, addressKk, addressEn,
      phone, email, sortOrder, isActive
    } = body;

    if (!name || !director || !address || !phone) {
      return errorResponse('Missing required fields: name, director, address, phone');
    }

    const region = await prisma.region.create({
      data: {
        name,
        nameKk,
        nameEn,
        director,
        directorKk,
        directorEn,
        address,
        addressKk,
        addressEn,
        phone,
        email,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(region);
  } catch (error) {
    return errorResponse('Failed to create region', 500);
  }
}
