import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

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

  const formattedDate = news.publishedAt.toLocaleDateString(
    locale === "kk" ? "kk-KZ" : locale === "en" ? "en-US" : "ru-RU",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back Button */}
      <Link href="/media/news">
        <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back_to_news")}
        </Button>
      </Link>

      {/* Article Header */}
      <article>
        {/* Featured Image */}
        {news.image && (
          <div className="relative aspect-[2/1] mb-8 rounded-xl overflow-hidden">
            <Image
              src={news.image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={news.publishedAt.toISOString()}>
              {formattedDate}
            </time>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            {t("share")}
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold
            prose-p:text-foreground/90
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t">
        <Link href="/media/news">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_news")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
