import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
    BorderStyle,
    AlignmentType,
    HeadingLevel,
} from "docx";

// GET /api/registrations/[id]/export/doc - Export registration to DOC
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

        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        text: "ЗАЯВКА НА УЧАСТИЕ В ТУРНИРЕ",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `№ ${registration.registrationNumber}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Registration info
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Регион: ", bold: true }),
                            new TextRun(registration.regionName),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Статус: ", bold: true }),
                            new TextRun(getStatusLabel(registration.status)),
                        ],
                    }),

                    // Tournament info
                    new Paragraph({
                        text: "",
                        spacing: { before: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Турнир: ", bold: true }),
                            new TextRun(registration.tournamentCategory?.tournament.title || ""),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Категория: ", bold: true }),
                            new TextRun(registration.tournamentCategory
                                ? `${getCategoryLabel(registration.tournamentCategory.category)} ${getGenderLabel(registration.tournamentCategory.gender)} - ${getBowTypeLabel(registration.tournamentCategory.type)}`
                                : ""),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Место проведения: ", bold: true }),
                            new TextRun(registration.tournamentCategory?.tournament.location || ""),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Дата турнира: ", bold: true }),
                            new TextRun(registration.tournamentCategory?.tournament.startDate
                                ? new Date(registration.tournamentCategory.tournament.startDate).toLocaleDateString("ru-RU")
                                : ""),
                        ],
                        spacing: { after: 400 },
                    }),

                    // Athletes section
                    new Paragraph({
                        text: "СПОРТСМЕНЫ",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400 },
                    }),

                    // Athletes table
                    createAthletesTable(registration.athleteRegistrations),

                    // Judges section
                    new Paragraph({
                        text: "СУДЬИ",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400 },
                    }),

                    // Judges table
                    createJudgesTable(registration.registrationJudges, registration.regionName),

                    // Footer
                    new Paragraph({
                        text: "",
                        spacing: { before: 400 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Дата подачи: ", bold: true }),
                            new TextRun(new Date(registration.createdAt).toLocaleDateString("ru-RU")),
                        ],
                    }),

                    // Approval info if approved
                    ...(registration.approvedAt ? [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Одобрено: ", bold: true }),
                                new TextRun(new Date(registration.approvedAt).toLocaleDateString("ru-RU")),
                            ],
                        }),
                    ] : []),

                    // Rejection reason if rejected
                    ...(registration.rejectionReason ? [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Причина отклонения: ", bold: true, color: "FF0000" }),
                                new TextRun({ text: registration.rejectionReason, color: "FF0000" }),
                            ],
                        }),
                    ] : []),
                ],
            }],
        });

        // Generate buffer
        const buffer = await Packer.toBuffer(doc);

        // Return DOC file - convert Buffer to Uint8Array for Response compatibility
        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${registration.registrationNumber}.docx"`,
            },
        });
    } catch (error) {
        console.error('Error exporting to DOC:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function createAthletesTable(athleteRegistrations: any[]): Table {
    const rows = [
        // Header row
        new TableRow({
            children: [
                createTableCell("№", true),
                createTableCell("ФИО", true),
                createTableCell("ИИН", true),
                createTableCell("Д.р.", true),
                createTableCell("Пол", true),
                createTableCell("Тренер", true),
            ],
        }),
        // Data rows
        ...athleteRegistrations.map((ar, idx) =>
            new TableRow({
                children: [
                    createTableCell((idx + 1).toString()),
                    createTableCell(ar.athlete.name),
                    createTableCell(ar.athlete.iin || "—"),
                    createTableCell(ar.athlete.dob || "—"),
                    createTableCell(ar.athlete.gender === "M" ? "М" : "Ж"),
                    createTableCell(ar.coach?.name || "—"),
                ],
            })
        ),
    ];

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
    });
}

function createJudgesTable(registrationJudges: any[], regionName: string): Table {
    const rows = [
        // Header row
        new TableRow({
            children: [
                createTableCell("№", true),
                createTableCell("ФИО", true),
                createTableCell("Категория", true),
                createTableCell("Регион", true),
            ],
        }),
        // Data rows
        ...registrationJudges.map((rj, idx) =>
            new TableRow({
                children: [
                    createTableCell((idx + 1).toString()),
                    createTableCell(rj.judge.name),
                    createTableCell(rj.judge.category),
                    createTableCell(rj.judge.region?.name || regionName),
                ],
            })
        ),
    ];

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
    });
}

function createTableCell(text: string, isHeader = false): TableCell {
    return new TableCell({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text,
                        bold: isHeader,
                        size: isHeader ? 22 : 20,
                    }),
                ],
            }),
        ],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
        },
    });
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

function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        Adults: "Взрослые",
        Youth: "Молодёжь",
        Juniors: "Юниоры",
        Cadets: "Кадеты (U18)",
        Cubs: "Юноши (U15)",
    };
    return labels[category] || category;
}

function getGenderLabel(gender: string): string {
    return gender === "M" ? "Мужчины" : "Женщины";
}

function getBowTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        Recurve: "Классический лук",
        Compound: "Блочный лук",
    };
    return labels[type] || type;
}
