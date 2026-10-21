import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PUBLIC_ATHLETE_SELECT } from "@/lib/public-selects";
import { calculatePoints, isValidPlace } from "@/lib/ranking-points";

interface ResultInput {
    athleteId: number;
    place: number;
    score?: number | null;
}

function isValidResult(r: unknown): r is ResultInput {
    const { athleteId, place, score } = (r ?? {}) as Record<string, unknown>;
    const validScore = score === undefined || score === null || (Number.isInteger(score) && (score as number) >= 0);
    return Number.isInteger(athleteId) && isValidPlace(place) && validScore;
}

// GET /api/tournaments/[id]/results - Get results for a tournament
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Список одобренных заявок нужен только экрану результатов в админке
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user.role !== 'Admin' && session.user.role !== 'Editor') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const tournamentId = parseInt(id);

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        // Get tournament with categories and results
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                categories: {
                    include: {
                        results: {
                            include: {
                                athlete: { select: PUBLIC_ATHLETE_SELECT }
                            },
                            orderBy: {
                                place: 'asc'
                            }
                        },
                        registrations: {
                            where: {
                                status: 'APPROVED'
                            },
                            select: {
                                id: true,
                                athleteRegistrations: {
                                    select: {
                                        athlete: { select: PUBLIC_ATHLETE_SELECT }
                                    }
                                }
                            }
                        }
                    },
                    where: categoryId ? { id: parseInt(categoryId) } : undefined
                }
            }
        });

        if (!tournament) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error('Error fetching tournament results:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/tournaments/[id]/results - Add results for a tournament category
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const userRole = session.user.role;
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const tournamentId = parseInt(id);
        const body = await req.json();
        const { categoryId, results } = body;

        // Validate
        if (!Number.isInteger(categoryId) || !Array.isArray(results)) {
            return NextResponse.json({ error: "categoryId and results array are required" }, { status: 400 });
        }
        if (!results.every(isValidResult)) {
            return NextResponse.json({ error: "Место — целое число от 1, результат — не меньше 0" }, { status: 400 });
        }

        // Verify category belongs to tournament
        const category = await prisma.tournamentCategory.findFirst({
            where: {
                id: categoryId,
                tournamentId: tournamentId
            }
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found for this tournament" }, { status: 404 });
        }

        // Validate results: check for duplicate places and athletes
        const places = results.map((r) => r.place);
        const athletes = results.map((r) => r.athleteId);

        if (new Set(places).size !== places.length) {
            return NextResponse.json({ error: "Duplicate places found" }, { status: 400 });
        }

        if (new Set(athletes).size !== athletes.length) {
            return NextResponse.json({ error: "Duplicate athletes found" }, { status: 400 });
        }

        // Create/update results in a transaction
        const createdResults = await prisma.$transaction(async (tx) => {
            // Delete existing results for this category
            await tx.tournamentResult.deleteMany({
                where: { tournamentCategoryId: categoryId }
            });

            // Create new results with auto-calculated points
            const newResults = [];
            for (const r of results) {
                const points = calculatePoints(r.place, category.category);
                const result = await tx.tournamentResult.create({
                    data: {
                        tournamentCategoryId: categoryId,
                        athleteId: r.athleteId,
                        place: r.place,
                        points: points,
                        score: r.score ?? null
                    },
                    include: {
                        athlete: {
                            select: {
                                id: true,
                                name: true,
                                regionRef: true
                            }
                        }
                    }
                });
                newResults.push(result);
            }

            return newResults;
        });

        return NextResponse.json({
            success: true,
            results: createdResults,
            message: 'Результаты сохранены'
        });
    } catch (error) {
        console.error('Error saving tournament results:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
