import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/gallery - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // photo | video
    const albumName = searchParams.get('album');
    const isPublished = searchParams.get('isPublished');
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      ...(type && { type }),
      ...(albumName && { albumName }),
      ...(isPublished !== null && { isPublished: isPublished !== 'false' }),
    };

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy: [
          { eventDate: 'desc' },
          { sortOrder: 'asc' },
        ],
        take: limit,
        skip,
      }),
      prisma.galleryItem.count({ where }),
    ]);

    return successResponse(items, { total, page, limit });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return errorResponse('Failed to fetch gallery items', 500);
  }
}

// POST /api/gallery - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      title, titleKk, titleEn,
      description, descriptionKk, descriptionEn,
      type, url, thumbnailUrl, albumName, eventDate,
      sortOrder, isPublished
    } = body;

    if (!title || !type || !url) {
      return errorResponse('Missing required fields: title, type, url');
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        titleKk,
        titleEn,
        description,
        descriptionKk,
        descriptionEn,
        type,
        url,
        thumbnailUrl,
        albumName,
        eventDate: eventDate ? new Date(eventDate) : null,
        sortOrder: sortOrder ?? 0,
        isPublished: isPublished ?? true,
      },
    });

    return successResponse(item);
  } catch (error) {
    console.error('Gallery POST error:', error);
    return errorResponse('Failed to create gallery item', 500);
  }
}
