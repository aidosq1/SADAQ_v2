import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';
import { revalidateTag } from 'next/cache';

// GET /api/translations/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const translationId = parseInt(id, 10);

    if (isNaN(translationId)) {
      return errorResponse('Invalid translation ID', 400);
    }

    const translation = await prisma.translation.findUnique({
      where: { id: translationId },
    });

    if (!translation) {
      return errorResponse('Translation not found', 404);
    }

    return successResponse(translation);
  } catch (error) {
    console.error('Failed to fetch translation:', error);
    return errorResponse('Failed to fetch translation', 500);
  }
}

// PATCH /api/translations/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const translationId = parseInt(id, 10);

    if (isNaN(translationId)) {
      return errorResponse('Invalid translation ID', 400);
    }

    const body = await request.json();
    const { namespace, key, ru, kk, en } = body;

    // Check if translation exists
    const existing = await prisma.translation.findUnique({
      where: { id: translationId },
    });

    if (!existing) {
      return errorResponse('Translation not found', 404);
    }

    // If changing namespace or key, check for duplicates
    if ((namespace && namespace !== existing.namespace) || (key && key !== existing.key)) {
      const duplicate = await prisma.translation.findUnique({
        where: {
          namespace_key: {
            namespace: namespace || existing.namespace,
            key: key || existing.key,
          },
        },
      });

      if (duplicate && duplicate.id !== translationId) {
        return errorResponse('Translation with this namespace and key already exists', 409);
      }
    }

    const translation = await prisma.translation.update({
      where: { id: translationId },
      data: {
        ...(namespace && { namespace }),
        ...(key && { key }),
        ...(ru !== undefined && { ru }),
        ...(kk !== undefined && { kk: kk || null }),
        ...(en !== undefined && { en: en || null }),
      },
    });

    // Invalidate cache
    revalidateTag('translations', 'max');

    return successResponse(translation);
  } catch (error) {
    console.error('Failed to update translation:', error);
    return errorResponse('Failed to update translation', 500);
  }
}

// DELETE /api/translations/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const translationId = parseInt(id, 10);

    if (isNaN(translationId)) {
      return errorResponse('Invalid translation ID', 400);
    }

    await prisma.translation.delete({
      where: { id: translationId },
    });

    // Invalidate cache
    revalidateTag('translations', 'max');

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Failed to delete translation:', error);
    return errorResponse('Failed to delete translation', 500);
  }
}
