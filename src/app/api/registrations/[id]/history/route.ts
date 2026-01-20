import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/registrations/[id]/history - Get audit log for registration
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

        // Check if registration exists and user has access
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId }
        });

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';
        const isOwner = registration.userId === userId;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch audit logs
        const auditLogs = await prisma.registrationAuditLog.findMany({
            where: { registrationId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: auditLogs
        });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
