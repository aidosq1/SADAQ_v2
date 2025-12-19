import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, generateSlug, parseQueryParams } from '@/lib/api-utils';

// GET /api/team - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // Recurve | Compound
    const gender = searchParams.get('gender'); // M | F
    const category = searchParams.get('category'); // Adults, Youth, etc.
    const isActive = searchParams.get('isActive');
    const { limit, page, skip } = parseQueryParams(searchParams);

    const where = {
      ...(type && { type }),
      ...(gender && { gender }),
      ...(category && { category }),
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    const [members, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: limit,
        skip,
        include: {
          rankings: {
            orderBy: { season: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.teamMember.count({ where }),
    ]);

    return successResponse(members, { total, page, limit });
  } catch (error) {
    console.error('Team GET error:', error);
    return errorResponse('Failed to fetch team members', 500);
  }
}

// POST /api/team - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      name, nameKk, nameEn,
      type, gender, category, region,
      coachName, coachNameKk, coachNameEn,
      birthYear, image, bio, bioKk, bioEn,
      isActive, sortOrder
    } = body;

    if (!name || !type || !gender || !category || !region) {
      return errorResponse('Missing required fields: name, type, gender, category, region');
    }

    const slug = generateSlug(name);
    const existing = await prisma.teamMember.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const member = await prisma.teamMember.create({
      data: {
        slug: finalSlug,
        name,
        nameKk,
        nameEn,
        type,
        gender,
        category,
        region,
        coachName,
        coachNameKk,
        coachNameEn,
        birthYear,
        image,
        bio,
        bioKk,
        bioEn,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(member);
  } catch (error) {
    console.error('Team POST error:', error);
    return errorResponse('Failed to create team member', 500);
  }
}
