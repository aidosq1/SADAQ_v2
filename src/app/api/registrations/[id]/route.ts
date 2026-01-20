import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/registrations/[id] - Get a single registration
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        region: true,
                        email: true
                    }
                },
                tournamentCategory: {
                    include: {
                        tournament: true
                    }
                },
                athleteRegistrations: {
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
                    }
                },
                registrationJudges: {
                    include: {
                        judge: {
                            include: {
                                region: true
                            }
                        }
                    }
                },
                documents: true
            }
        });

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        // Check access: admin or own registration
        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';

        if (!isAdmin && registration.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(registration);
    } catch (error) {
        console.error('Error fetching registration:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/registrations/[id] - Update registration status
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';

        const { id } = await params;
        const registrationId = parseInt(id);
        const body = await req.json();
        const { status, rejectionReason } = body;

        // Fetch the registration to check ownership
        const existingRegistration = await prisma.registration.findUnique({
            where: { id: registrationId }
        });

        if (!existingRegistration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        // RegionalRepresentative can only withdraw their own pending registrations
        if (!isAdmin) {
            if (existingRegistration.userId !== userId) {
                return NextResponse.json({ error: "Forbidden: Not your registration" }, { status: 403 });
            }
            if (status !== 'WITHDRAWN') {
                return NextResponse.json({ error: "Forbidden: You can only withdraw registrations" }, { status: 403 });
            }
            if (existingRegistration.status !== 'PENDING') {
                return NextResponse.json({ error: "Cannot withdraw: registration is not pending" }, { status: 400 });
            }
        }

        // Validate status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // If rejecting, require reason
        if (status === 'REJECTED' && !rejectionReason) {
            return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
        }

        const updateData: any = {};

        if (status) {
            updateData.status = status;

            if (status === 'APPROVED') {
                updateData.approvedAt = new Date();
                updateData.approvedBy = session.user?.name || 'Admin';
                updateData.rejectionReason = null;
            } else if (status === 'REJECTED') {
                updateData.rejectionReason = rejectionReason;
                updateData.approvedAt = null;
                updateData.approvedBy = null;
            }
        }

        const registration = await prisma.registration.update({
            where: { id: registrationId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                tournamentCategory: {
                    include: {
                        tournament: {
                            select: {
                                title: true
                            }
                        }
                    }
                },
                athleteRegistrations: {
                    include: {
                        athlete: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            registration,
            message: status === 'APPROVED'
                ? 'Заявка одобрена'
                : status === 'REJECTED'
                    ? 'Заявка отклонена'
                    : 'Статус заявки обновлён'
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/registrations/[id] - Delete registration (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const userRole = (session.user as any).role;
        if (userRole !== 'Admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const registrationId = parseInt(id);

        await prisma.registration.delete({
            where: { id: registrationId }
        });

        return NextResponse.json({ success: true, message: 'Заявка удалена' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
