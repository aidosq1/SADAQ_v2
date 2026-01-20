import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// GET /api/registrations/[id]/export/excel - Export registration to Excel
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

        // Fetch registration with all related data
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
                user: {
                    select: {
                        username: true,
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
                        athlete: true,
                        coach: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                registrationJudges: {
                    include: {
                        judge: {
                            include: {
                                region: true
                            }
                        }
                    }
                }
            }
        });

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        // Check access
        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isAdmin = userRole === 'Admin' || userRole === 'Editor';
        const isOwner = registration.userId === userId;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Info sheet
        const infoData = [
            ["Заявка на турнир"],
            [""],
            ["Номер заявки", registration.registrationNumber],
            ["Статус", getStatusLabel(registration.status)],
            ["Регион", registration.regionName],
            [""],
            ["Турнир", registration.tournamentCategory?.tournament.title || ""],
            ["Категория", registration.tournamentCategory
                ? `${registration.tournamentCategory.category} ${registration.tournamentCategory.gender} - ${registration.tournamentCategory.type}`
                : ""],
            ["Место проведения", registration.tournamentCategory?.tournament.location || ""],
            ["Дата турнира", registration.tournamentCategory?.tournament.startDate
                ? new Date(registration.tournamentCategory.tournament.startDate).toLocaleDateString("ru-RU")
                : ""],
            [""],
            ["Дата подачи", new Date(registration.createdAt).toLocaleDateString("ru-RU")],
            ["Подал", registration.user.username],
        ];

        if (registration.approvedAt) {
            infoData.push(["Одобрено", new Date(registration.approvedAt).toLocaleDateString("ru-RU")]);
            infoData.push(["Одобрил", registration.approvedBy || ""]);
        }

        if (registration.rejectionReason) {
            infoData.push(["Причина отклонения", registration.rejectionReason]);
        }

        const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
        infoSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(workbook, infoSheet, "Информация");

        // Athletes sheet
        const athletesData = [
            ["#", "ФИО", "ИИН", "Дата рождения", "Пол", "Тренер"]
        ];

        registration.athleteRegistrations.forEach((ar, idx) => {
            athletesData.push([
                (idx + 1).toString(),
                ar.athlete.name,
                ar.athlete.iin || "",
                ar.athlete.dob || "",
                ar.athlete.gender === "M" ? "Мужской" : "Женский",
                ar.coach?.name || ""
            ]);
        });

        const athletesSheet = XLSX.utils.aoa_to_sheet(athletesData);
        athletesSheet["!cols"] = [
            { wch: 5 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 30 }
        ];
        XLSX.utils.book_append_sheet(workbook, athletesSheet, "Спортсмены");

        // Judges sheet
        const judgesData = [
            ["#", "ФИО", "Категория", "Регион"]
        ];

        registration.registrationJudges.forEach((rj, idx) => {
            judgesData.push([
                (idx + 1).toString(),
                rj.judge.name,
                rj.judge.category,
                rj.judge.region?.name || registration.regionName
            ]);
        });

        const judgesSheet = XLSX.utils.aoa_to_sheet(judgesData);
        judgesSheet["!cols"] = [
            { wch: 5 },
            { wch: 30 },
            { wch: 20 },
            { wch: 25 }
        ];
        XLSX.utils.book_append_sheet(workbook, judgesSheet, "Судьи");

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Return Excel file
        return new Response(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${registration.registrationNumber}.xlsx"`,
            },
        });
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "PENDING": return "На проверке";
        case "APPROVED": return "Одобрено";
        case "REJECTED": return "Отклонено";
        case "WITHDRAWN": return "Отозвано";
        default: return status;
    }
}
