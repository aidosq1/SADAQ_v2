import prisma from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { NewsBlockClient } from "./NewsBlockClient";

async function getNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });
    return news;
  } catch {
    return [];
  }
}

export async function NewsBlock() {
  const news = await getNews();
  const locale = await getLocale();
  const tHeader = await getTranslations("Header");
  const tNews = await getTranslations("NewsPage");

  if (news.length === 0) return null;

  const translations = {
    sectionTitle: tHeader("news"),
    allNewsText: tNews("all_news"),
  };

  // Serialize the dates for client component
  const serializedNews = news.map(item => ({
    id: item.id,
    slug: item.slug,
    image: item.image,
    category: item.category,
    publishedAt: item.publishedAt,
    title: item.title,
    titleKk: item.titleKk,
    titleEn: item.titleEn,
  }));

  return (
    <NewsBlockClient
      news={serializedNews}
      locale={locale}
      translations={translations}
    />
  );
}
