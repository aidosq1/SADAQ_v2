import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { PageContainer } from "@/components/ui/container";
import { BackLink } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/news/ShareButton";
import { getNewsCategoryLabel } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import DOMPurify from "isomorphic-dompurify";
import { formatDate } from "@/lib/date-format";
import { toNewsHtml } from "@/lib/news-content";

interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  content: string;
  contentKk: string | null;
  contentEn: string | null;
  excerpt: string | null;
  excerptKk: string | null;
  excerptEn: string | null;
  category: string;
  image: string | null;
  publishedAt: Date;
}

function getLocalizedTitle(news: NewsArticle, locale: string): string {
  if (locale === "kk" && news.titleKk) return news.titleKk;
  if (locale === "en" && news.titleEn) return news.titleEn;
  return news.title;
}

function getLocalizedContent(news: NewsArticle, locale: string): string {
  if (locale === "kk" && news.contentKk) return news.contentKk;
  if (locale === "en" && news.contentEn) return news.contentEn;
  return news.content;
}

function getLocalizedExcerpt(news: NewsArticle, locale: string): string {
  if (locale === "kk" && news.excerptKk) return news.excerptKk;
  if (locale === "en" && news.excerptEn) return news.excerptEn;
  return news.excerpt || "";
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const news = await prisma.news.findUnique({
    where: { slug },
  });
  return news;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return { title: "Not Found" };
  }

  const title = getLocalizedTitle(news, locale);
  const description = getLocalizedExcerpt(news, locale) || title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: news.image ? [news.image] : [],
      type: "article",
      publishedTime: news.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: news.image ? [news.image] : [],
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug, locale } = await params;
  const news = await getNewsBySlug(slug);
  const t = await getTranslations("NewsPage");

  if (!news) {
    notFound();
  }

  const title = getLocalizedTitle(news, locale);
  const content = getLocalizedContent(news, locale);

  const formattedDate = formatDate(news.publishedAt, locale);

  return (
    <PageContainer size="narrow">
      <BackLink href="/media/news" label={t("back_to_news")} className="mb-6" />

      <article>
        {news.image && (
          <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-lg bg-muted">
            <Image
              src={news.image}
              alt={title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="type-small flex items-center gap-3 text-muted-foreground">
            <Badge variant="brand">{getNewsCategoryLabel(news.category, locale)}</Badge>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <time dateTime={news.publishedAt.toISOString()}>{formattedDate}</time>
            </span>
          </div>
          <ShareButton title={title} label={t("share")} />
        </div>

        <h1 className="type-h1 mb-6 text-primary">{title}</h1>

        <div
          className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-primary
            prose-p:text-foreground/90
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          "
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toNewsHtml(content), { ADD_ATTR: ["target"] }) }}
        />
      </article>
    </PageContainer>
  );
}
