import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, parseQueryParams } from '@/lib/api-utils';

// GET /api/slides - Public
// Returns news items that have showInSlider=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit } = parseQueryParams(searchParams);

    const slides = await prisma.news.findMany({
      where: {
        showInSlider: true,
      },
      orderBy: { sliderOrder: 'asc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        titleKk: true,
        titleEn: true,
        excerpt: true,
        excerptKk: true,
        excerptEn: true,
        image: true,
        sliderOrder: true,
        publishedAt: true,
      },
    });

    // Transform to match expected slide format
    const transformedSlides = slides.map(news => ({
      id: news.id,
      title: news.title,
      titleKk: news.titleKk,
      titleEn: news.titleEn,
      description: news.excerpt,
      descriptionKk: news.excerptKk,
      descriptionEn: news.excerptEn,
      image: news.image,
      linkUrl: `/media/news/${news.slug}`,
      sortOrder: news.sliderOrder,
      isActive: true,
    }));

    return successResponse(transformedSlides);
  } catch (error) {
    return errorResponse('Failed to fetch slides', 500);
  }
}
