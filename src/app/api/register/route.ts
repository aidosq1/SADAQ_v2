
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

interface RequestBody {
    judge: {
        fullName: string;
        category: string;
        region: string;
    };
    participants: {
        fullName: string;
        iin: string;
        dob: string;
        gender: "M" | "F";
        category: string;
        weaponClass: string;
        coachName: string;
    }[];
}

export async function POST(req: Request) {
    try {
        // 1. Authentication Check
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt((session.user as any).id);
        const body: RequestBody = await req.json();
        const { judge, participants } = body;

        // 2. Helper to get category key
        const getCategoryKey = (p: any) => `${p.category}-${p.gender}-${p.weaponClass}`;

        // 3. Server-side Validation: Max 4 per category
        const counts: Record<string, number> = {};
        for (const p of participants) {
            const key = getCategoryKey(p);
            counts[key] = (counts[key] || 0) + 1;

            if (counts[key] > 4) {
                return NextResponse.json({
                    error: `Validation Error: More than 4 athletes in category ${p.weaponClass} ${p.category} (${p.gender})`
                }, { status: 400 });
            }
        }

        // 4. Create Registration Transaction
        // Assuming active tournament ID = 1 for now (from seed)
        const activeTournamentId = 1;

        // Optional: Check if already registered for this tournament? 
        // For now allow multiple, or maybe we want to Append?
        // User request implies "Submit Application", let's create a NEW registration record each time

        const result = await prisma.$transaction(async (tx) => {
            // Create Registration
            const registration = await tx.registration.create({
                data: {
                    userId: userId,
                    regionName: session.user?.name || "Unknown",
                    judgeName: judge.fullName,
                    judgeCategory: judge.category,
                    judgeRegion: judge.region,
                    tournamentId: activeTournamentId,
                }
            });

            // Create Athletes
            if (participants.length > 0) {
                await tx.athlete.createMany({
                    data: participants.map((p) => ({
                        registrationId: registration.id,
                        fullName: p.fullName,
                        iin: p.iin,
                        dob: p.dob,
                        gender: p.gender,
                        category: p.category,
                        weaponClass: p.weaponClass,
                        coachName: p.coachName || null
                    }))
                });
            }

            return registration;
        });

        return NextResponse.json({ success: true, registrationId: result.id });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
