import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';
import { revalidateTag } from 'next/cache';

// GET /api/translations - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');
    const key = searchParams.get('key');
    const search = searchParams.get('search');
    const { limit, skip } = parseQueryParams(searchParams);

    const where: Record<string, unknown> = {};

    if (namespace) {
      where.namespace = namespace;
    }

    if (key) {
      where.key = key;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { ru: { contains: search, mode: 'insensitive' } },
        { kk: { contains: search, mode: 'insensitive' } },
        { en: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
        take: limit,
        skip,
      }),
      prisma.translation.count({ where }),
    ]);

    // Get list of namespaces for filters
    const namespaces = await prisma.translation.findMany({
      select: { namespace: true },
      distinct: ['namespace'],
      orderBy: { namespace: 'asc' },
    });

    return successResponse(translations, {
      total,
      limit,
      skip,
      namespaces: namespaces.map((n) => n.namespace),
    });
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return errorResponse('Failed to fetch translations', 500);
  }
}

// POST /api/translations - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { namespace, key, ru, kk, en } = body;

    if (!namespace || !key || !ru) {
      return errorResponse('Missing required fields: namespace, key, ru');
    }

    // Check for existing translation
    const existing = await prisma.translation.findUnique({
      where: { namespace_key: { namespace, key } },
    });

    if (existing) {
      return errorResponse('Translation with this namespace and key already exists', 409);
    }

    const translation = await prisma.translation.create({
      data: {
        namespace,
        key,
        ru,
        kk: kk || null,
        en: en || null,
      },
    });

    // Invalidate cache
    revalidateTag('translations', 'max');

    return successResponse(translation);
  } catch (error) {
    console.error('Failed to create translation:', error);
    return errorResponse('Failed to create translation', 500);
  }
}
