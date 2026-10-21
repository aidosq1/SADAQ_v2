import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getLocalizedField } from "@/lib/localization";
import { formatDateRange } from "@/lib/date-format";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";

interface Props {
    params: Promise<{ id: string; locale: string }>;
}

// Страница турнира рисуется на клиенте, поэтому метаданные берём из базы здесь
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id, locale } = await params;
    const tournamentId = Number(id);
    if (!Number.isInteger(tournamentId) || tournamentId <= 0) return {};

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: {
                id: true,
                title: true,
                titleKk: true,
                titleEn: true,
                location: true,
                locationKk: true,
                locationEn: true,
                description: true,
                descriptionKk: true,
                descriptionEn: true,
                startDate: true,
                endDate: true,
            },
        });
        if (!tournament) return {};

        const when = formatDateRange(tournament.startDate, tournament.endDate, locale);
        const where = getLocalizedField(tournament, "location", locale);
        const about = getLocalizedField(tournament, "description", locale);
        const summary = `${when}, ${where}`;

        return buildPageMetadata({
            locale,
            path: `/tournaments/${tournament.id}`,
            title: getLocalizedField(tournament, "title", locale),
            description: truncateDescription(about ? `${summary}. ${about}` : summary),
        });
    } catch (error) {
        console.error("Tournament metadata error:", error);
        return {};
    }
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
