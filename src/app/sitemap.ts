import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { sitemapEntries, STATIC_PAGE_PATHS } from "@/lib/seo";

// Данные из базы: на этапе сборки её нет, поэтому sitemap собирается на каждый запрос
export const dynamic = "force-dynamic";

async function getDynamicEntries(): Promise<MetadataRoute.Sitemap> {
    const [news, tournaments, athletes] = await Promise.all([
        prisma.news.findMany({
            select: { slug: true, updatedAt: true },
            orderBy: { publishedAt: "desc" },
        }),
        prisma.tournament.findMany({
            select: { id: true },
            orderBy: { startDate: "desc" },
        }),
        // Только состав сборной: на них ведут ссылки со страницы /team
        prisma.athlete.findMany({
            where: { isActive: true, nationalTeamMemberships: { some: { isActive: true } } },
            select: { slug: true, updatedAt: true },
            orderBy: { sortOrder: "asc" },
        }),
    ]);

    return [
        ...news.flatMap((item) => sitemapEntries(`/media/news/${item.slug}`, item.updatedAt)),
        ...tournaments.flatMap((item) => sitemapEntries(`/tournaments/${item.id}`)),
        ...athletes.flatMap((item) => sitemapEntries(`/team/${item.slug}`, item.updatedAt)),
    ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticEntries = STATIC_PAGE_PATHS.flatMap((path) => sitemapEntries(path));

    try {
        return [...staticEntries, ...(await getDynamicEntries())];
    } catch (error) {
        // Без базы отдаём хотя бы разделы сайта, а не 500
        console.error("Sitemap: failed to load dynamic pages:", error);
        return staticEntries;
    }
}
