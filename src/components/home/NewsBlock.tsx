import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/localization";

async function getNews() {
  try {
    const news = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });
    console.log("News fetched in NewsBlock:", news.length);
    return news;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
}

export async function NewsBlock() {
  const news = await getNews();
  const locale = await getLocale();

  if (news.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const sectionTitle = locale === 'kk' ? 'Федерация жаңалықтары' : locale === 'en' ? 'Federation News' : 'Новости Федерации';
  const allNewsText = locale === 'kk' ? 'Барлық жаңалықтар' : locale === 'en' ? 'All News' : 'Все новости';

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{sectionTitle}</h2>
        <Link href="/media" className="text-sm font-medium text-primary hover:underline flex items-center">
          {allNewsText} <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
        {/* Main News */}
        <div className="relative group overflow-hidden rounded-xl bg-gray-100 h-full">
          <Link href={`/media/${news[0].slug}`} className="block h-full w-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${news[0].image || '/slides/archer_tokyo.png'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <Badge className="mb-3 bg-primary hover:bg-primary/90">{news[0].category}</Badge>
              <div className="text-sm opacity-80 mb-2">{formatDate(news[0].publishedAt)}</div>
              <h3 className="text-2xl font-bold leading-tight">
                {getLocalizedField(news[0], 'title', locale)}
              </h3>
            </div>
          </Link>
        </div>

        {/* Secondary News */}
        <div className="flex flex-col gap-8 h-full">
          {news.slice(1).map((item) => (
            <div key={item.id} className="relative group overflow-hidden rounded-xl bg-gray-100 flex-1">
              <Link href={`/media/${item.slug}`} className="block h-full w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image || '/slides/archer_tokyo.png'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-white/20 text-white border-none hover:bg-white/30">
                    {item.category}
                  </Badge>
                  <div className="text-xs opacity-80 mb-1">{formatDate(item.publishedAt)}</div>
                  <h3 className="text-lg font-bold leading-tight">
                    {getLocalizedField(item, 'title', locale)}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
