import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/tournaments/featured - Public
// Returns the featured tournament for the Hero section
export async function GET() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        isFeatured: true,
      },
      include: {
        categories: true
      }
    });

    // Return null if no featured tournament (Hero will show fallback)
    return successResponse(tournament);
  } catch (error) {
    return errorResponse('Failed to fetch featured tournament', 500);
  }
}
