import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/rankings/recalculate - Recalculate all rankings based on tournament results
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const userRole = (session.user as any).role;
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        // Get all tournament results for the specified year
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        // Get results from completed tournaments (endDate has passed)
        const results = await prisma.tournamentResult.findMany({
            where: {
                tournamentCategory: {
                    tournament: {
                        startDate: {
                            gte: startDate,
                            lte: endDate
                        },
                        // Tournament is considered completed when endDate has passed
                        endDate: { lt: new Date() }
                    }
                }
            },
            include: {
                athlete: {
                    select: {
                        id: true
                    }
                },
                tournamentCategory: {
                    select: {
                        category: true,
                        gender: true,
                        type: true
                    }
                }
            }
        });

        // Aggregate points by athlete and category/gender/type
        const aggregatedPoints: Record<string, {
            athleteId: number;
            category: string;
            gender: string;
            type: string;
            totalPoints: number;
        }> = {};

        for (const result of results) {
            // Use tournament category for grouping (not athlete's current category)
            const key = `${result.athleteId}-${result.tournamentCategory.category}-${result.tournamentCategory.gender}-${result.tournamentCategory.type}`;

            if (!aggregatedPoints[key]) {
                aggregatedPoints[key] = {
                    athleteId: result.athleteId,
                    category: result.tournamentCategory.category,
                    gender: result.tournamentCategory.gender,
                    type: result.tournamentCategory.type,
                    totalPoints: 0
                };
            }

            aggregatedPoints[key].totalPoints += result.points;
        }

        // Group by category/gender/type for ranking
        const groupedByCategory: Record<string, typeof aggregatedPoints[string][]> = {};

        for (const data of Object.values(aggregatedPoints)) {
            const groupKey = `${data.category}-${data.gender}-${data.type}`;
            if (!groupedByCategory[groupKey]) {
                groupedByCategory[groupKey] = [];
            }
            groupedByCategory[groupKey].push(data);
        }

        // Sort each group by points and assign ranks
        const rankingUpdates: {
            athleteId: number;
            category: string;
            gender: string;
            type: string;
            points: number;
            rank: number;
        }[] = [];

        for (const group of Object.values(groupedByCategory)) {
            // Sort by points descending
            group.sort((a, b) => b.totalPoints - a.totalPoints);

            // Assign ranks
            group.forEach((item, index) => {
                rankingUpdates.push({
                    athleteId: item.athleteId,
                    category: item.category,
                    gender: item.gender,
                    type: item.type,
                    points: item.totalPoints,
                    rank: index + 1
                });
            });
        }

        // Update rankings in transaction
        await prisma.$transaction(async (tx) => {
            // Upsert all ranking entries
            for (const ranking of rankingUpdates) {
                await tx.rankingEntry.upsert({
                    where: {
                        athleteId_category_gender_type: {
                            athleteId: ranking.athleteId,
                            category: ranking.category,
                            gender: ranking.gender,
                            type: ranking.type
                        }
                    },
                    update: {
                        points: ranking.points,
                        rank: ranking.rank
                    },
                    create: {
                        athleteId: ranking.athleteId,
                        category: ranking.category,
                        gender: ranking.gender,
                        type: ranking.type,
                        points: ranking.points,
                        rank: ranking.rank
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: `Рейтинг пересчитан. Обновлено ${rankingUpdates.length} записей.`,
            updatedCount: rankingUpdates.length,
            year: year
        });
    } catch (error) {
        console.error('Error recalculating rankings:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
