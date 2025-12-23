import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/news/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      // Try to find by slug
      const news = await prisma.news.findUnique({
        where: { slug: id },
      });
      if (!news) {
        return errorResponse('News not found', 404);
      }
      return successResponse(news);
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!news) {
      return errorResponse('News not found', 404);
    }

    return successResponse(news);
  } catch (error) {
    return errorResponse('Failed to fetch news', 500);
  }
}

// PATCH /api/news/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const newsId = parseInt(id);
    const body = await request.json();

    // Convert publishedAt string to Date if present
    if (body.publishedAt && typeof body.publishedAt === 'string') {
      body.publishedAt = new Date(body.publishedAt);
    }

    const news = await prisma.news.update({
      where: { id: newsId },
      data: body,
    });

    return successResponse(news);
  } catch (error) {
    return errorResponse('Failed to update news', 500);
  }
}

// DELETE /api/news/[id] - Protected (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const newsId = parseInt(id);

    await prisma.news.delete({
      where: { id: newsId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete news', 500);
  }
}
