import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils';

// GET /api/documents/[id] - Public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = parseInt(id);

    const document = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document) {
      return errorResponse('Document not found', 404);
    }

    return successResponse(document);
  } catch (error) {
    console.error('Document GET by ID error:', error);
    return errorResponse('Failed to fetch document', 500);
  }
}

// PATCH /api/documents/[id] - Protected
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin', 'Editor']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const docId = parseInt(id);
    const body = await request.json();

    const document = await prisma.document.update({
      where: { id: docId },
      data: body,
    });

    return successResponse(document);
  } catch (error) {
    console.error('Document PATCH error:', error);
    return errorResponse('Failed to update document', 500);
  }
}

// DELETE /api/documents/[id] - Protected
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(['Admin']);
    if (!auth.authorized) return auth.error;

    const { id } = await params;
    const docId = parseInt(id);

    await prisma.document.delete({
      where: { id: docId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Document DELETE error:', error);
    return errorResponse('Failed to delete document', 500);
  }
}
