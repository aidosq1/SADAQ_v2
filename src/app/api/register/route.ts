import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthWithRegion, generateSlug } from "@/lib/api-utils";
import { Prisma } from "@prisma/client";
import { findDuplicateIds, getAthleteEligibilityIssue, getAthleteEligibilityError, getMaxAthletes } from "@/lib/registration-rules";

type ErrorParams = Record<string, string | number>;

// code и params — для формы: она показывает ошибку на языке сайта (ключи ApplyPage.err_*), error — запасной текст
function fail(error: string, status: number, code?: string, params?: ErrorParams) {
    return NextResponse.json({ error, code, params }, { status });
}

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

type TransactionClient = Prisma.TransactionClient;

// Generate unique registration number: REG-YYYY-XXXX
// Must be called inside a transaction to prevent race conditions
async function generateRegistrationNumber(tx: TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REG-${year}-`;

    // Find the last registration number for this year
    const lastReg = await tx.registration.findFirst({
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
            if (!entry.judgeId && entry.newJudge) {
                if (!entry.newJudge.name?.trim()) {
                    return NextResponse.json({ error: `Судья ${i + 1}: укажите ФИО` }, { status: 400 });
                }
                if (!entry.newJudge.category?.trim()) {
                    return NextResponse.json({ error: `Судья ${i + 1}: укажите категорию` }, { status: 400 });
                }
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

        if (findDuplicateIds(judgeEntries.map((j) => j.judgeId)).length > 0) {
            return fail("Судья указан в заявке дважды", 400, "duplicate_judge");
        }
        if (findDuplicateIds(participants.map((p) => p.athleteId)).length > 0) {
            return fail("Спортсмен указан в заявке дважды", 400, "duplicate_athlete");
        }

        // Check if tournament category exists and tournament is open for registration
        const tournamentCategory = await prisma.tournamentCategory.findUnique({
            where: { id: tournamentCategoryId },
            include: { tournament: true }
        });

        if (!tournamentCategory) {
            return fail("Tournament category not found", 404, "category_not_found");
        }

        // Check if registration is open
        const tournament = tournamentCategory.tournament;
        const now = new Date();

        // Tournament must not have started yet
        if (now >= new Date(tournament.startDate)) {
            return fail("Tournament has already started", 400, "tournament_started");
        }

        // Registration must be manually enabled
        if (!tournament.isRegistrationOpen) {
            return fail("Registration is not open for this tournament", 400, "registration_closed");
        }

        // Check registration deadline
        if (tournament.registrationDeadline && now > new Date(tournament.registrationDeadline)) {
            return fail("Registration deadline has passed", 400, "deadline_passed");
        }

        // Validate participants count based on whether user's region is the host
        const isHostRegion = tournament.organizingRegionId === userRegionId;
        const maxParticipants = getMaxAthletes(isHostRegion);

        if (participants.length > maxParticipants) {
            return fail(`Максимум ${maxParticipants} спортсменов для вашего региона`, 400, "max_athletes", { max: maxParticipants });
        }

        // Athletes must match the category gender and belong to the user's region
        const athleteIds = participants.map((p) => p.athleteId).filter((id): id is number => !!id);
        const selectedAthletes = await prisma.athlete.findMany({
            where: { id: { in: athleteIds } },
            select: { id: true, name: true, gender: true, regionId: true }
        });
        for (const athleteId of athleteIds) {
            const athlete = selectedAthletes.find((a) => a.id === athleteId);
            if (!athlete) {
                return fail(`Спортсмен #${athleteId} не найден`, 400, "athlete_not_found", { id: athleteId });
            }
            const issue = getAthleteEligibilityIssue(athlete, tournamentCategory, userRegionId);
            if (issue) {
                const error = getAthleteEligibilityError(athlete, tournamentCategory, userRegionId) ?? issue;
                return fail(error, 400, issue, { name: athlete.name });
            }
        }
        for (const p of participants) {
            if (!p.athleteId && p.newAthlete && p.newAthlete.gender !== tournamentCategory.gender) {
                return fail(`${p.newAthlete.name}: пол спортсмена не совпадает с категорией`, 400, "gender_mismatch", { name: p.newAthlete.name });
            }
        }

        // Create Registration Transaction
        // All checks and creation happen inside the transaction to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
            // Check if this region already has a registration for this category
            // Allow resubmission if previous registration was rejected
            if (userRegionId) {
                const existingRegistration = await tx.registration.findFirst({
                    where: {
                        tournamentCategoryId: tournamentCategoryId,
                        regionId: userRegionId,
                        status: { notIn: ['REJECTED', 'WITHDRAWN'] }
                    }
                });

                if (existingRegistration) {
                    throw new Error("DUPLICATE_REGISTRATION");
                }
            }

            // Generate registration number inside transaction
            const registrationNumber = await generateRegistrationNumber(tx);

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
                    // Generate slug from name with proper Cyrillic transliteration
                    const baseSlug = generateSlug(p.newAthlete.name);
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
        if (error instanceof Error && error.message === "DUPLICATE_REGISTRATION") {
            return fail("Ваш регион уже подал заявку на эту категорию турнира", 400, "duplicate_registration");
        }
        // Unique constraints: the same athlete or judge twice, or a parallel duplicate registration
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return fail("Заявка не сохранена: спортсмен, судья или заявка региона уже есть", 400, "conflict");
        }
        console.error('Registration error:', error);
        return fail("Не удалось сохранить заявку", 500, "save_failed");
    }
}
