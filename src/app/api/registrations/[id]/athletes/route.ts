import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to check registration access and permissions
async function checkRegistrationAccess(registrationId: number, session: any) {
    const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
            tournamentCategory: {
                include: {
                    tournament: true
                }
            }
        }
    });

    if (!registration) {
        return { error: "Registration not found", status: 404 };
    }

    const userRole = session.user.role;
    const userId = parseInt(session.user.id);
    const isAdmin = userRole === 'Admin' || userRole === 'Editor';
    const isOwner = registration.userId === userId;

    // Only admin/editor or owner can access
    if (!isAdmin && !isOwner) {
        return { error: "Forbidden", status: 403 };
    }

    // Check if registration can be edited
    const canEdit = isAdmin || (isOwner && registration.status === 'PENDING');

    return { registration, isAdmin, isOwner, canEdit, userId };
}

// Helper to create audit log
async function createAuditLog(
    registrationId: number,
    userId: number,
    action: string,
    entityType: string,
    entityId: number | null,
    previousData: any,
    newData: any,
    description: string
) {
    await prisma.registrationAuditLog.create({
        data: {
            registrationId,
            userId,
            action,
            entityType,
            entityId,
            previousData,
            newData,
            description
        }
    });
}

// GET /api/registrations/[id]/athletes - List athletes in registration
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        const access = await checkRegistrationAccess(registrationId, session);
        if ('error' in access) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        const athleteRegistrations = await prisma.athleteRegistration.findMany({
            where: { registrationId },
            include: {
                athlete: {
                    include: {
                        regionRef: true
                    }
                },
                coach: {
                    include: {
                        region: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({
            success: true,
            data: athleteRegistrations
        });
    } catch (error) {
        console.error('Error fetching athletes:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/registrations/[id]/athletes - Add athlete to registration
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        const access = await checkRegistrationAccess(registrationId, session);
        if ('error' in access) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        if (!access.canEdit) {
            return NextResponse.json({
                error: "Cannot edit this registration"
            }, { status: 403 });
        }

        const body = await req.json();
        const { athleteId, coachId } = body;

        if (!athleteId) {
            return NextResponse.json({ error: "athleteId is required" }, { status: 400 });
        }

        // Check if athlete already exists in this registration
        const existingAthlete = await prisma.athleteRegistration.findUnique({
            where: {
                athleteId_registrationId: {
                    athleteId: parseInt(athleteId),
                    registrationId
                }
            }
        });

        if (existingAthlete) {
            return NextResponse.json({
                error: "Athlete already in this registration"
            }, { status: 400 });
        }

        // Check max athletes limit
        const currentCount = await prisma.athleteRegistration.count({
            where: { registrationId }
        });

        const isHostRegion = access.registration.tournamentCategory?.tournament.organizingRegionId ===
            access.registration.regionId;
        const maxAthletes = isHostRegion ? 6 : 4;

        if (currentCount >= maxAthletes) {
            return NextResponse.json({
                error: `Maximum ${maxAthletes} athletes allowed`
            }, { status: 400 });
        }

        // Get athlete info for audit log
        const athlete = await prisma.athlete.findUnique({
            where: { id: parseInt(athleteId) }
        });

        if (!athlete) {
            return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
        }

        // Create athlete registration
        const athleteRegistration = await prisma.athleteRegistration.create({
            data: {
                registrationId,
                athleteId: parseInt(athleteId),
                coachId: coachId ? parseInt(coachId) : null
            },
            include: {
                athlete: true,
                coach: true
            }
        });

        // Create audit log
        await createAuditLog(
            registrationId,
            access.userId,
            'CREATE',
            'athlete',
            athleteRegistration.id,
            null,
            { athleteId, athleteName: athlete.name, coachId },
            `Добавлен спортсмен: ${athlete.name}`
        );

        return NextResponse.json({
            success: true,
            data: athleteRegistration,
            message: 'Спортсмен добавлен'
        });
    } catch (error) {
        console.error('Error adding athlete:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/registrations/[id]/athletes - Update athlete registration (coach)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        const access = await checkRegistrationAccess(registrationId, session);
        if ('error' in access) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        if (!access.canEdit) {
            return NextResponse.json({
                error: "Cannot edit this registration"
            }, { status: 403 });
        }

        const body = await req.json();
        const { athleteRegistrationId, coachId } = body;

        if (!athleteRegistrationId) {
            return NextResponse.json({
                error: "athleteRegistrationId is required"
            }, { status: 400 });
        }

        // Get current state for audit log
        const currentAthReg = await prisma.athleteRegistration.findUnique({
            where: { id: parseInt(athleteRegistrationId) },
            include: { athlete: true, coach: true }
        });

        if (!currentAthReg || currentAthReg.registrationId !== registrationId) {
            return NextResponse.json({
                error: "Athlete registration not found"
            }, { status: 404 });
        }

        // Get new coach name for audit log
        let newCoachName = null;
        if (coachId) {
            const newCoach = await prisma.coach.findUnique({
                where: { id: parseInt(coachId) }
            });
            newCoachName = newCoach?.name;
        }

        // Update
        const athleteRegistration = await prisma.athleteRegistration.update({
            where: { id: parseInt(athleteRegistrationId) },
            data: {
                coachId: coachId ? parseInt(coachId) : null
            },
            include: {
                athlete: true,
                coach: true
            }
        });

        // Create audit log
        await createAuditLog(
            registrationId,
            access.userId,
            'UPDATE',
            'athlete',
            athleteRegistration.id,
            {
                coachId: currentAthReg.coachId,
                coachName: currentAthReg.coach?.name
            },
            {
                coachId: coachId ? parseInt(coachId) : null,
                coachName: newCoachName
            },
            `Изменён тренер для ${currentAthReg.athlete.name}: ${currentAthReg.coach?.name || 'не назначен'} → ${newCoachName || 'не назначен'}`
        );

        return NextResponse.json({
            success: true,
            data: athleteRegistration,
            message: 'Данные обновлены'
        });
    } catch (error) {
        console.error('Error updating athlete:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/registrations/[id]/athletes - Remove athlete from registration
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        const access = await checkRegistrationAccess(registrationId, session);
        if ('error' in access) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }

        if (!access.canEdit) {
            return NextResponse.json({
                error: "Cannot edit this registration"
            }, { status: 403 });
        }

        const url = new URL(req.url);
        const athleteRegistrationId = url.searchParams.get('id');

        if (!athleteRegistrationId) {
            return NextResponse.json({
                error: "athleteRegistrationId is required as query param ?id=X"
            }, { status: 400 });
        }

        // Get current state for audit log
        const currentAthReg = await prisma.athleteRegistration.findUnique({
            where: { id: parseInt(athleteRegistrationId) },
            include: { athlete: true, coach: true }
        });

        if (!currentAthReg || currentAthReg.registrationId !== registrationId) {
            return NextResponse.json({
                error: "Athlete registration not found"
            }, { status: 404 });
        }

        // Check minimum athletes
        const currentCount = await prisma.athleteRegistration.count({
            where: { registrationId }
        });

        if (currentCount <= 1) {
            return NextResponse.json({
                error: "Minimum 1 athlete required"
            }, { status: 400 });
        }

        // Delete
        await prisma.athleteRegistration.delete({
            where: { id: parseInt(athleteRegistrationId) }
        });

        // Create audit log
        await createAuditLog(
            registrationId,
            access.userId,
            'DELETE',
            'athlete',
            parseInt(athleteRegistrationId),
            {
                athleteId: currentAthReg.athleteId,
                athleteName: currentAthReg.athlete.name,
                coachId: currentAthReg.coachId,
                coachName: currentAthReg.coach?.name
            },
            null,
            `Удалён спортсмен: ${currentAthReg.athlete.name}`
        );

        return NextResponse.json({
            success: true,
            message: 'Спортсмен удалён'
        });
    } catch (error) {
        console.error('Error deleting athlete:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
