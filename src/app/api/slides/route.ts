import { NextRequest } from 'next/server';
import { successResponse, errorResponse, parseQueryParams } from '@/lib/api-utils';
import { getHeroSlides } from '@/lib/slides';

// GET /api/slides - Public
// Returns news items that have showInSlider=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit } = parseQueryParams(searchParams);
    return successResponse(await getHeroSlides(limit));
  } catch (error) {
    console.error('Slides API error:', error);
    return errorResponse('Failed to fetch slides', 500);
  }
}
