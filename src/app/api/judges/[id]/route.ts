import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion } from '@/lib/api-utils';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/judges/[id] - Public
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const judgeId = parseInt(id);

    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: {
        region: true,
      },
    });

    if (!judge) {
      return errorResponse('Judge not found', 404);
    }

    return successResponse(judge);
  } catch (error) {
    return errorResponse('Failed to fetch judge', 500);
  }
}

// PATCH /api/judges/[id] - Protected
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const judgeId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingJudge = await prisma.judge.findUnique({ where: { id: judgeId } });
      if (!existingJudge || existingJudge.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    const body = await request.json();

    if (body.regionId !== undefined) {
      // For RegionalRepresentative, force their region
      if (auth.userRegionId) {
        body.regionId = auth.userRegionId;
      } else {
        body.regionId = body.regionId ? parseInt(body.regionId) : null;
      }
    }

    const judge = await prisma.judge.update({
      where: { id: judgeId },
      data: body,
      include: {
        region: true,
      },
    });

    return successResponse(judge);
  } catch (error) {
    console.error('Judge update error:', error);
    return errorResponse('Failed to update judge', 500);
  }
}

// DELETE /api/judges/[id] - Protected
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const judgeId = parseInt(id);

    // For RegionalRepresentative, verify ownership
    if (auth.userRegionId) {
      const existingJudge = await prisma.judge.findUnique({ where: { id: judgeId } });
      if (!existingJudge || existingJudge.regionId !== auth.userRegionId) {
        return errorResponse('Forbidden: Not your region', 403);
      }
    }

    await prisma.judge.delete({
      where: { id: judgeId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete judge', 500);
  }
}
