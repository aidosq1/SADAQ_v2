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

    // Validate and filter allowed fields
    const allowedFields = [
      'title', 'titleKk', 'titleEn',
      'section', 'fileUrl', 'fileType', 'fileSize',
      'year', 'sortOrder', 'isPublished'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Convert numeric fields if needed
    if (updateData.fileSize) {
      updateData.fileSize = parseInt(updateData.fileSize);
    }
    if (updateData.year) {
      updateData.year = parseInt(updateData.year);
    }

    const document = await prisma.document.update({
      where: { id: docId },
      data: updateData,
    });

    return successResponse(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update document',
      500
    );
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
    return errorResponse('Failed to delete document', 500);
  }
}
