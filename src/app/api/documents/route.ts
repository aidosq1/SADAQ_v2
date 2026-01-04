import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/documents - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // statute | rules | antidoping | calendar | ratings
    const isPublished = searchParams.get('isPublished');
    const year = searchParams.get('year');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(section && { section }),
      ...(isPublished !== null && { isPublished: isPublished !== 'false' }),
      ...(year && { year: parseInt(year) }),
    };

    const documents = await prisma.document.findMany({
      where,
      orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
      take: limit,
    });

    return successResponse(documents);
  } catch (error) {
    return errorResponse('Failed to fetch documents', 500);
  }
}

// POST /api/documents - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      title, titleKk, titleEn,
      section, fileUrl, fileType, fileSize,
      year, sortOrder, isPublished
    } = body;

    if (!title || !section || !fileUrl) {
      return errorResponse('Missing required fields: title, section, fileUrl');
    }

    const document = await prisma.document.create({
      data: {
        title,
        titleKk,
        titleEn,
        section,
        fileUrl,
        fileType,
        fileSize: fileSize ? parseInt(fileSize) : null,
        year: year ? parseInt(year) : null,
        sortOrder: sortOrder ?? 0,
        isPublished: isPublished ?? true,
      },
    });

    return successResponse(document);
  } catch (error) {
    return errorResponse('Failed to create document', 500);
  }
}
