import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
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

  if (news.length === 0) return null;

  const translations = {
    sectionTitle: locale === 'kk' ? 'Жаңалықтар' : locale === 'en' ? 'News' : 'Новости',
    allNewsText: locale === 'kk' ? 'Барлық жаңалықтар' : locale === 'en' ? 'All News' : 'Все новости',
    pressCenter: locale === 'kk' ? 'Баспасөз орталығы' : locale === 'en' ? 'Press Center' : 'Пресс-центр',
    readMore: locale === 'kk' ? 'Толығырақ' : locale === 'en' ? 'Read More' : 'Подробнее',
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
