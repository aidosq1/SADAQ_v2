import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/partners - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    const partners = await prisma.partner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return successResponse(partners);
  } catch (error) {
    return errorResponse('Failed to fetch partners', 500);
  }
}

// POST /api/partners - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      name, logo, websiteUrl, instagramUrl, facebookUrl,
      description, descriptionKk, descriptionEn,
      sortOrder, isActive
    } = body;

    if (!name) {
      return errorResponse('Missing required field: name');
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        logo,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        description,
        descriptionKk,
        descriptionEn,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(partner);
  } catch (error) {
    return errorResponse('Failed to create partner', 500);
  }
}
