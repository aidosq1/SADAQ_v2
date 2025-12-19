import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, generateSlug, parseQueryParams } from '@/lib/api-utils';

// GET /api/news - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isMain = searchParams.get('isMain');
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      isPublished: true,
      ...(category && { category }),
      ...(isMain !== null && { isMain: isMain === 'true' }),
    };

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.news.count({ where }),
    ]);

    return successResponse(news, { total, page, limit });
  } catch (error) {
    console.error('News GET error:', error);
    return errorResponse('Failed to fetch news', 500);
  }
}

// POST /api/news - Protected (Admin/Editor)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      title, titleKk, titleEn,
      content, contentKk, contentEn,
      excerpt, excerptKk, excerptEn,
      category, image, isMain, isPublished
    } = body;

    if (!title || !content || !category) {
      return errorResponse('Missing required fields: title, content, category');
    }

    const slug = generateSlug(title);

    // Check for slug uniqueness
    const existing = await prisma.news.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const news = await prisma.news.create({
      data: {
        slug: finalSlug,
        title,
        titleKk,
        titleEn,
        content,
        contentKk,
        contentEn,
        excerpt,
        excerptKk,
        excerptEn,
        category,
        image,
        isMain: isMain ?? false,
        isPublished: isPublished ?? true,
      },
    });

    return successResponse(news);
  } catch (error) {
    console.error('News POST error:', error);
    return errorResponse('Failed to create news', 500);
  }
}
