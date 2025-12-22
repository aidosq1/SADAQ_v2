import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';

// GET /api/regions/[id]/users - Get users for a region
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;

    const users = await prisma.user.findMany({
      where: { regionId: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch (error) {
    console.error('Region users GET error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

// POST /api/regions/[id]/users - Create user for a region
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { username, password, email, role = 'RegionalRepresentative' } = body;

    if (!username || !password) {
      return errorResponse('Username and password are required');
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse('Username already exists');
    }

    // Get region name for the region field
    const region = await prisma.region.findUnique({
      where: { id: parseInt(id) },
    });

    if (!region) {
      return errorResponse('Region not found', 404);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role,
        regionId: parseInt(id),
        region: region.name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Region user POST error:', error);
    return errorResponse('Failed to create user', 500);
  }
}
