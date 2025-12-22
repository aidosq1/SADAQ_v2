import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';
import { revalidateTag } from 'next/cache';

// POST /api/translations/revalidate - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    revalidateTag('translations', 'max');

    return successResponse({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to revalidate translations:', error);
    return errorResponse('Failed to revalidate translations', 500);
  }
}
