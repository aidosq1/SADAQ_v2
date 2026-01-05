import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthWithRegion } from "@/lib/api-utils";

interface NewJudge {
    name: string;
    category: string;
    regionId?: number;
}

interface NewAthlete {
    name: string;
    iin?: string;
    dob?: string;
    gender: string;
    category: string;
    type: string; // Recurve | Compound
}

interface NewCoach {
    name: string;
    regionId?: number;
}

interface Participant {
    athleteId: number | null;
    newAthlete?: NewAthlete;
    coachId: number | null;
    newCoach?: NewCoach;
}

// Судья может быть либо выбран из базы (judgeId), либо новый (newJudge)
interface JudgeEntry {
    judgeId?: number | null;
    newJudge?: NewJudge;
}

interface DocumentData {
    fileName: string;
    fileUrl: string;
}

interface RequestBody {
    tournamentCategoryId: number;
    // Поддержка старого формата (один судья)
    judgeId?: number | null;
    newJudge?: NewJudge;
    // Новый формат (массив судей)
    judges?: JudgeEntry[];
    participants: Participant[];
    // Прикреплённые документы (опционально)
    documents?: DocumentData[];
}

// Generate unique registration number: REG-YYYY-XXXX
async function generateRegistrationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REG-${year}-`;

    // Find the last registration number for this year
    const lastReg = await prisma.registration.findFirst({
        where: {
            registrationNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            registrationNumber: 'desc'
        }
    });

    let nextNum = 1;
    if (lastReg) {
        const lastNum = parseInt(lastReg.registrationNumber.split('-')[2]);
        nextNum = lastNum + 1;
    }

    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

export async function POST(req: Request) {
    try {
        // 1. Authentication & Role Check - only RegionalRepresentative can submit
        const auth = await requireAuthWithRegion(['RegionalRepresentative']);
        if (!auth.authorized) return auth.error;

        const userId = auth.userId!;
        const userRegionId = auth.userRegionId;
        const body: RequestBody = await req.json();
        const { tournamentCategoryId, judgeId, newJudge, judges, participants, documents } = body;

        // Validate tournamentCategoryId
        if (!tournamentCategoryId) {
            return NextResponse.json({ error: "Tournament category is required" }, { status: 400 });
        }

        // Поддержка нового формата (массив судей) и старого (один судья)
        let judgeEntries: JudgeEntry[] = [];
        if (judges && judges.length > 0) {
            judgeEntries = judges;
        } else if (judgeId || newJudge) {
            // Обратная совместимость со старым форматом
            judgeEntries = [{ judgeId, newJudge }];
        }

        // Validate judges - must have at least one
        if (judgeEntries.length === 0) {
            return NextResponse.json({ error: "At least one judge is required" }, { status: 400 });
        }

        // Validate each judge entry
        for (let i = 0; i < judgeEntries.length; i++) {
            const entry = judgeEntries[i];
            if (!entry.judgeId && !entry.newJudge) {
                return NextResponse.json({
                    error: `Judge ${i + 1}: must have either existing judge or new judge data`
                }, { status: 400 });
            }
        }

        // Validate participants
        if (!participants || participants.length === 0) {
            return NextResponse.json({ error: "At least one participant is required" }, { status: 400 });
        }

        // Validate each participant has athlete and coach
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            if (!p.athleteId && !p.newAthlete) {
                return NextResponse.json({
                    error: `Participant ${i + 1}: Athlete is required`
                }, { status: 400 });
            }
            if (!p.coachId && !p.newCoach) {
                return NextResponse.json({
                    error: `Participant ${i + 1}: Coach is required`
                }, { status: 400 });
            }
        }

        // Check if tournament category exists and tournament is open for registration
        const tournamentCategory = await prisma.tournamentCategory.findUnique({
            where: { id: tournamentCategoryId },
            include: { tournament: true }
        });

        if (!tournamentCategory) {
            return NextResponse.json({ error: "Tournament category not found" }, { status: 404 });
        }

        // Check if registration is open
        const tournament = tournamentCategory.tournament;
        const now = new Date();

        // Tournament must not have started yet
        if (now >= new Date(tournament.startDate)) {
            return NextResponse.json({ error: "Tournament has already started" }, { status: 400 });
        }

        // Registration must be manually enabled
        if (!tournament.isRegistrationOpen) {
            return NextResponse.json({ error: "Registration is not open for this tournament" }, { status: 400 });
        }

        // Check registration deadline
        if (tournament.registrationDeadline && now > new Date(tournament.registrationDeadline)) {
            return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
        }

        // Validate participants count based on whether user's region is the host
        const isHostRegion = tournament.organizingRegionId === userRegionId;
        const maxParticipants = isHostRegion ? 6 : 4;

        if (participants.length > maxParticipants) {
            return NextResponse.json({
                error: `Максимум ${maxParticipants} спортсменов для вашего региона`
            }, { status: 400 });
        }

        // Check if this region already has a registration for this category
        // Allow resubmission if previous registration was rejected
        if (userRegionId) {
            const existingRegistration = await prisma.registration.findFirst({
                where: {
                    tournamentCategoryId: tournamentCategoryId,
                    regionId: userRegionId,
                    status: { not: 'REJECTED' }
                }
            });

            if (existingRegistration) {
                return NextResponse.json({
                    error: "Ваш регион уже подал заявку на эту категорию турнира"
                }, { status: 400 });
            }
        }

        // Generate registration number
        const registrationNumber = await generateRegistrationNumber();

        // Create Registration Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Handle Judges - create new ones if needed, collect all judge IDs
            const finalJudgeIds: number[] = [];
            let primaryJudgeId: number | null = null;

            for (const entry of judgeEntries) {
                let currentJudgeId = entry.judgeId;

                if (!currentJudgeId && entry.newJudge) {
                    const createdJudge = await tx.judge.create({
                        data: {
                            name: entry.newJudge.name,
                            category: entry.newJudge.category,
                            regionId: entry.newJudge.regionId || userRegionId,
                            isActive: true,
                        }
                    });
                    currentJudgeId = createdJudge.id;
                }

                if (currentJudgeId) {
                    // Verify judge exists
                    const existingJudge = await tx.judge.findUnique({ where: { id: currentJudgeId } });
                    if (!existingJudge) {
                        throw new Error(`Judge with ID ${currentJudgeId} not found`);
                    }
                    finalJudgeIds.push(currentJudgeId);

                    // Первый судья будет основным (для обратной совместимости)
                    if (primaryJudgeId === null) {
                        primaryJudgeId = currentJudgeId;
                    }
                }
            }

            // Get user's region name for the registration
            let regionName = auth.userRegion || "Unknown";
            if (userRegionId) {
                const region = await tx.region.findUnique({ where: { id: userRegionId } });
                if (region) {
                    regionName = region.name;
                }
            }

            // 2. Create Registration
            const registration = await tx.registration.create({
                data: {
                    registrationNumber,
                    userId: userId,
                    regionName: regionName,
                    regionId: userRegionId,
                    tournamentCategoryId: tournamentCategoryId,
                    status: 'PENDING',
                }
            });

            // 3. Create RegistrationJudge links for all judges
            for (const jId of finalJudgeIds) {
                await tx.registrationJudge.create({
                    data: {
                        registrationId: registration.id,
                        judgeId: jId,
                    }
                });
            }

            // 3. Process each participant
            for (const p of participants) {
                // Handle Athlete
                let finalAthleteId = p.athleteId;
                if (!finalAthleteId && p.newAthlete) {
                    // Generate slug from name
                    const baseSlug = p.newAthlete.name
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[.']/g, '')
                        .replace(/[^a-z0-9-]/g, '');
                    const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

                    // Check if athlete with same IIN exists
                    let existingAthlete = p.newAthlete.iin
                        ? await tx.athlete.findFirst({ where: { iin: p.newAthlete.iin } })
                        : null;

                    if (existingAthlete) {
                        finalAthleteId = existingAthlete.id;
                    } else {
                        const createdAthlete = await tx.athlete.create({
                            data: {
                                slug: uniqueSlug,
                                name: p.newAthlete.name,
                                iin: p.newAthlete.iin || null,
                                dob: p.newAthlete.dob || null,
                                gender: p.newAthlete.gender,
                                regionId: userRegionId,
                                isActive: true,
                            }
                        });
                        finalAthleteId = createdAthlete.id;
                    }
                }

                // Handle Coach
                let finalCoachId = p.coachId;
                if (!finalCoachId && p.newCoach) {
                    const createdCoach = await tx.coach.create({
                        data: {
                            name: p.newCoach.name,
                            regionId: p.newCoach.regionId || userRegionId,
                            isActive: true,
                        }
                    });
                    finalCoachId = createdCoach.id;
                }

                // Verify athlete and coach exist
                if (finalAthleteId) {
                    const existingAthlete = await tx.athlete.findUnique({ where: { id: finalAthleteId } });
                    if (!existingAthlete) {
                        throw new Error(`Athlete with ID ${finalAthleteId} not found`);
                    }
                }

                if (finalCoachId) {
                    const existingCoach = await tx.coach.findUnique({ where: { id: finalCoachId } });
                    if (!existingCoach) {
                        throw new Error(`Coach with ID ${finalCoachId} not found`);
                    }
                }

                // Create AthleteRegistration link
                await tx.athleteRegistration.create({
                    data: {
                        athleteId: finalAthleteId!,
                        registrationId: registration.id,
                        coachId: finalCoachId,
                    }
                });
            }

            // 4. Create RegistrationDocument records for uploaded documents
            if (documents && documents.length > 0) {
                for (const doc of documents) {
                    await tx.registrationDocument.create({
                        data: {
                            registrationId: registration.id,
                            fileName: doc.fileName,
                            fileUrl: doc.fileUrl,
                        }
                    });
                }
            }

            return registration;
        });

        return NextResponse.json({
            success: true,
            registrationId: result.id,
            registrationNumber: result.registrationNumber,
            message: "Заявка отправлена на модерацию"
        });
    } catch (error) {
        console.error('Registration error:', error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
