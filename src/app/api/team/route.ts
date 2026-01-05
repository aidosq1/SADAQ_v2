import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, requireAuthWithRegion, generateSlug, parseQueryParams } from '@/lib/api-utils';

// GET /api/team - Public (returns national team members by category/gender/type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'Recurve'; // Recurve | Compound
    const gender = searchParams.get('gender') || 'M'; // M | F
    const category = searchParams.get('category') || 'Adults'; // Adults, Youth, etc.
    const isActive = searchParams.get('isActive');
    const allAthletes = searchParams.get('all'); // If 'true', return all athletes (for admin)
    const { limit, page, skip } = parseQueryParams(searchParams);

    // For admin - return all athletes (with region filter for RegionalRepresentative)
    if (allAthletes === 'true') {
      const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
      if (!auth.authorized) return auth.error;

      // Filter only by gender for admin view (type/category removed from Athlete)
      const where: Record<string, unknown> = {
        ...(searchParams.get('gender') && gender !== 'all' && { gender }),
        ...(isActive !== null && { isActive: isActive !== 'false' }),
      };

      // For RegionalRepresentative, filter by their region
      if (auth.userRegionId) {
        where.regionId = auth.userRegionId;
      }

      const [athletes, total] = await Promise.all([
        prisma.athlete.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          take: limit,
          skip,
          include: {
            nationalTeamMemberships: true,
            rankings: true,
            regionRef: true,
            coach: true,
          },
        }),
        prisma.athlete.count({ where }),
      ]);

      return successResponse(athletes, { total, page, limit });
    }

    // For public - return athletes who are in national team for this category/gender/type
    const memberships = await prisma.nationalTeamMembership.findMany({
      where: {
        category,
        gender,
        type,
        isActive: true,
      },
      include: {
        athlete: {
          include: {
            rankings: {
              where: { category, gender, type },
              take: 1,
            },
          },
        },
      },
      orderBy: { athlete: { sortOrder: 'asc' } },
      take: limit,
      skip,
    });

    const total = await prisma.nationalTeamMembership.count({
      where: { category, gender, type, isActive: true },
    });

    const athletes = memberships.map(m => m.athlete);

    return successResponse(athletes, { total, page, limit, category, gender, type });
  } catch (error) {
    console.error('Team API error:', error);
    return errorResponse('Failed to fetch athletes', 500);
  }
}

// POST /api/team - Protected
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithRegion(['Admin', 'Editor', 'RegionalRepresentative']);
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    let {
      name, nameKk, nameEn,
      iin, dob,
      gender, regionId,
      image,
      nationalTeamMemberships, // Array of { category, gender, type }
      isActive, sortOrder,
      // Поля свидетельства о регистрации спортсмена
      registrationNumber,
      registrationDate,
      sportsRank,
      sportsRankDate,
      sportsRankOrder,
      medicalStatus,
      medicalDate,
      medicalExpiry,
      disqualificationInfo,
      dopingInfo,
      awardsInfo,
      coachId,
      additionalInfo,
    } = body;

    // For RegionalRepresentative, force their region
    if (auth.userRegionId) {
      regionId = auth.userRegionId;
    }

    if (!name || !gender) {
      return errorResponse('Missing required fields: name, gender');
    }

    const slug = generateSlug(name);
    const existing = await prisma.athlete.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const athlete = await prisma.athlete.create({
      data: {
        slug: finalSlug,
        name,
        nameKk,
        nameEn,
        iin,
        dob,
        gender,
        regionId,
        image,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        // Поля свидетельства о регистрации
        registrationNumber,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
        sportsRank,
        sportsRankDate: sportsRankDate ? new Date(sportsRankDate) : null,
        sportsRankOrder,
        medicalStatus,
        medicalDate: medicalDate ? new Date(medicalDate) : null,
        medicalExpiry: medicalExpiry ? new Date(medicalExpiry) : null,
        disqualificationInfo,
        dopingInfo,
        awardsInfo,
        coachId: coachId ? parseInt(coachId) : null,
        additionalInfo,
        // Create national team memberships if provided
        nationalTeamMemberships: nationalTeamMemberships?.length ? {
          createMany: {
            data: nationalTeamMemberships.map((m: { category: string; gender: string; type: string }) => ({
              category: m.category,
              gender: m.gender,
              type: m.type,
            })),
          },
        } : undefined,
      },
      include: {
        nationalTeamMemberships: true,
        regionRef: true,
        coach: true,
      },
    });

    return successResponse(athlete);
  } catch (error) {
    console.error('Create athlete error:', error);
    return errorResponse('Failed to create athlete', 500);
  }
}
