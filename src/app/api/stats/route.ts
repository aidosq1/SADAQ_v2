import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/stats - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    const stats = await prisma.siteStat.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return successResponse(stats);
  } catch (error) {
    return errorResponse('Failed to fetch stats', 500);
  }
}

// POST /api/stats - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      key, value, label, labelKk, labelEn,
      iconType, sortOrder, isActive
    } = body;

    if (!key || !value || !label) {
      return errorResponse('Missing required fields: key, value, label');
    }

    const stat = await prisma.siteStat.create({
      data: {
        key,
        value,
        label,
        labelKk,
        labelEn,
        iconType: iconType ?? 'default',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(stat);
  } catch (error) {
    return errorResponse('Failed to create stat', 500);
  }
}
