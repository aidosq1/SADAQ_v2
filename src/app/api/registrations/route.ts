import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/registrations - List all registrations (admin) or user's registrations
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const tournamentId = searchParams.get('tournamentId');
        const status = searchParams.get('status');
        const region = searchParams.get('region');
        const myOnly = searchParams.get('my') === 'true';

        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';

        // Build where clause
        const where: any = {};

        // If not admin or requesting own registrations, filter by user
        if (!isAdmin || myOnly) {
            where.userId = userId;
        }

        // Filter by tournament
        if (tournamentId) {
            where.tournamentCategory = {
                tournamentId: parseInt(tournamentId)
            };
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by region
        if (region) {
            where.regionName = region;
        }

        const registrations = await prisma.registration.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        region: true
                    }
                },
                judge: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        region: {
                            select: { name: true }
                        }
                    }
                },
                tournamentCategory: {
                    include: {
                        tournament: {
                            select: {
                                id: true,
                                title: true,
                                titleKk: true,
                                titleEn: true,
                                startDate: true,
                                endDate: true,
                                location: true
                            }
                        }
                    }
                },
                athleteRegistrations: {
                    include: {
                        athlete: {
                            select: {
                                id: true,
                                name: true,
                                nameKk: true,
                                nameEn: true,
                                iin: true,
                                dob: true,
                                gender: true,
                                region: true
                            }
                        },
                        coach: {
                            select: {
                                id: true,
                                name: true,
                                region: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
