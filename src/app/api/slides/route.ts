import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/slides - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    const slides = await prisma.slide.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return successResponse(slides);
  } catch (error) {
    console.error('Slides GET error:', error);
    return errorResponse('Failed to fetch slides', 500);
  }
}

// POST /api/slides - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      title, titleKk, titleEn,
      description, descriptionKk, descriptionEn,
      image, imageClass, linkUrl, sortOrder, isActive
    } = body;

    if (!title || !image) {
      return errorResponse('Missing required fields: title, image');
    }

    const slide = await prisma.slide.create({
      data: {
        title,
        titleKk,
        titleEn,
        description,
        descriptionKk,
        descriptionEn,
        image,
        imageClass,
        linkUrl,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(slide);
  } catch (error) {
    console.error('Slides POST error:', error);
    return errorResponse('Failed to create slide', 500);
  }
}
