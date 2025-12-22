import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/history - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      isActive: true,
    };

    const [events, total] = await Promise.all([
      prisma.historyEvent.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip,
      }),
      prisma.historyEvent.count({ where }),
    ]);

    return successResponse(events, { total, page, limit });
  } catch (error) {
    return errorResponse('Failed to fetch history events', 500);
  }
}

// POST /api/history - Protected (Admin/Editor)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      year, title, titleKk, titleEn,
      description, descriptionKk, descriptionEn,
      iconType, sortOrder, isActive
    } = body;

    if (!year || !title || !description) {
      return errorResponse('Missing required fields: year, title, description');
    }

    const event = await prisma.historyEvent.create({
      data: {
        year,
        title,
        titleKk,
        titleEn,
        description,
        descriptionKk,
        descriptionEn,
        iconType: iconType ?? 'calendar',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(event);
  } catch (error) {
    return errorResponse('Failed to create history event', 500);
  }
}
