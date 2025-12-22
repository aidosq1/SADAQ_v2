"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, ArrowRight } from "lucide-react";

interface NewsItem {
  id: number;
  slug: string;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  excerpt?: string | null;
  excerptKk?: string | null;
  excerptEn?: string | null;
  category: string;
  image?: string | null;
  publishedAt: string;
}

function getLocalizedTitle(item: NewsItem, locale: string): string {
  if (locale === "kk" && item.titleKk) return item.titleKk;
  if (locale === "en" && item.titleEn) return item.titleEn;
  return item.title;
}

function getLocalizedExcerpt(item: NewsItem, locale: string): string {
  if (locale === "kk" && item.excerptKk) return item.excerptKk;
  if (locale === "en" && item.excerptEn) return item.excerptEn;
  return item.excerpt || "";
}

interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function NewsPage() {
  const t = useTranslations("NewsPage");
  const locale = useLocale();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchNews(1, true);
  }, []);

  async function fetchNews(pageNum: number, reset: boolean = false) {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      const res = await fetch(`/api/news?${params}`);
      const data: NewsResponse = await res.json();

      if (data.success) {
        if (reset) {
          setNews(data.data);
        } else {
          setNews((prev) => [...prev, ...data.data]);
        }
        if (data.meta) {
          const calculatedTotalPages = Math.ceil(data.meta.total / data.meta.limit);
          setTotalPages(calculatedTotalPages);
        }
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleLoadMore() {
    if (page < totalPages) {
      fetchNews(page + 1, false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === "kk" ? "kk-KZ" : locale === "en" ? "en-US" : "ru-RU",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">{t("no_news")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link key={item.id} href={`/media/news/${item.slug}`}>
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={getLocalizedTitle(item, locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-4xl font-bold">
                        {getLocalizedTitle(item, locale).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {getLocalizedTitle(item, locale)}
                  </h3>
                  {(item.excerpt || item.excerptKk || item.excerptEn) && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {getLocalizedExcerpt(item, locale)}
                    </p>
                  )}
                  <div className="flex items-center text-primary text-sm font-medium pt-2">
                    {t("read_more")}
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("load_more")}...
              </>
            ) : (
              t("load_more")
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
