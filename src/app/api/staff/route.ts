import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth, parseQueryParams } from '@/lib/api-utils';

// GET /api/staff - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department'); // leadership | coaching | committee
    const isActive = searchParams.get('isActive');
    const { limit } = parseQueryParams(searchParams);

    const where = {
      ...(department && { department }),
      ...(isActive !== null && { isActive: isActive !== 'false' }),
    };

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return successResponse(staff);
  } catch (error) {
    return errorResponse('Failed to fetch staff', 500);
  }
}

// POST /api/staff - Protected (Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const {
      name, nameKk, nameEn,
      role, roleTitle, roleTitleKk, roleTitleEn,
      description, descriptionKk, descriptionEn,
      department, image, sortOrder, isActive
    } = body;

    if (!name || !role || !roleTitle || !department) {
      return errorResponse('Missing required fields: name, role, roleTitle, department');
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        nameKk,
        nameEn,
        role,
        roleTitle,
        roleTitleKk,
        roleTitleEn,
        description,
        descriptionKk,
        descriptionEn,
        department,
        image,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return successResponse(staff);
  } catch (error) {
    return errorResponse('Failed to create staff member', 500);
  }
}
