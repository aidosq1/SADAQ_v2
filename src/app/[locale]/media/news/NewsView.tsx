"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/date-format";
import { getNewsCategoryLabel, NEWS_PAGE_SIZE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { MediaCard } from "@/components/ui/media-card";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/states";

export interface NewsItem {
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

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

function pageCount(meta: NewsResponse["meta"]): number {
  return meta ? Math.ceil(meta.total / meta.limit) : 1;
}

interface NewsViewProps {
  // Первая страница списка, загруженная на сервере
  initialResponse?: Pick<NewsResponse, "data" | "meta">;
}

export default function NewsView({ initialResponse }: NewsViewProps) {
  const t = useTranslations("NewsPage");
  const locale = useLocale();

  const [news, setNews] = useState<NewsItem[]>(initialResponse?.data ?? []);
  const [loading, setLoading] = useState(!initialResponse);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(pageCount(initialResponse?.meta));
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Первая страница пришла с сервера вместе с HTML
    if (initialResponse) return;
    fetchNews(1, true);
  }, [initialResponse]);

  async function fetchNews(pageNum: number, reset: boolean = false) {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: NEWS_PAGE_SIZE.toString(),
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
          setTotalPages(pageCount(data.meta));
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


  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={t("title")} />
        <LoadingState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      {news.length === 0 ? (
        <EmptyState icon={Newspaper} title={t("no_news")} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <MediaCard
              key={item.id}
              href={`/media/news/${item.slug}`}
              title={getLocalizedTitle(item, locale)}
              image={item.image}
              badge={<Badge variant="brand">{getNewsCategoryLabel(item.category, locale)}</Badge>}
              meta={
                <>
                  <Calendar className="size-3.5" />
                  {formatDate(item.publishedAt, locale)}
                </>
              }
              excerpt={getLocalizedExcerpt(item, locale) || undefined}
            />
          ))}
        </div>
      )}

      {page < totalPages && (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 className="animate-spin" />}
            {t("load_more")}
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
