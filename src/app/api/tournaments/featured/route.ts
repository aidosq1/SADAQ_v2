import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/tournaments/featured - Public
// Returns the nearest tournament that has not finished yet for the Hero section.
// A featured tournament wins among upcoming ones; past tournaments are never returned.
export async function GET() {
  try {
    const notFinished = { endDate: { gte: new Date() } };
    const query = {
      orderBy: { startDate: 'asc' as const },
      include: { categories: true },
    };

    const tournament =
      (await prisma.tournament.findFirst({ ...query, where: { ...notFinished, isFeatured: true } })) ??
      (await prisma.tournament.findFirst({ ...query, where: notFinished }));

    // Return null if nothing is upcoming (Hero hides the card)
    return successResponse(tournament);
  } catch (error) {
    console.error('Featured tournament API error:', error);
    return errorResponse('Failed to fetch featured tournament', 500);
  }
}
