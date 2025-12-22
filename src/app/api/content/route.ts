import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/content - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const key = searchParams.get('key');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(section && { section }),
      ...(key && { key }),
    };

    const content = await prisma.siteContent.findMany({
      where,
      orderBy: { key: 'asc' },
      take: limit,
    });

    return successResponse(content);
  } catch (error) {
    return errorResponse('Failed to fetch content', 500);
  }
}

// POST /api/content - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { key, section, value, valueKk, valueEn } = body;

    if (!key || !section || !value) {
      return errorResponse('Missing required fields: key, section, value');
    }

    const content = await prisma.siteContent.create({
      data: {
        key,
        section,
        value,
        valueKk,
        valueEn,
      },
    });

    return successResponse(content);
  } catch (error) {
    return errorResponse('Failed to create content', 500);
  }
}
