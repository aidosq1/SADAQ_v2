import { Metadata } from "next";
import { cache } from "react";
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
import { absoluteUrl, buildPageMetadata, localizedPath, truncateDescription } from "@/lib/seo";
import { newsArticleJsonLd, serializeJsonLd } from "@/lib/structured-data";

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
  updatedAt: Date;
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

// Анонс, а без него — начало текста новости
function getDescription(news: NewsArticle, locale: string): string {
  const source = getLocalizedExcerpt(news, locale) || toNewsHtml(getLocalizedContent(news, locale));
  return truncateDescription(source) || getLocalizedTitle(news, locale);
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// cache: generateMetadata и страница делят один запрос к базе
const getNewsBySlug = cache(async (slug: string): Promise<NewsArticle | null> => {
  return prisma.news.findUnique({
    where: { slug },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return { title: "Not Found" };
  }

  return buildPageMetadata({
    locale,
    path: `/media/news/${news.slug}`,
    title: getLocalizedTitle(news, locale),
    description: getDescription(news, locale),
    image: news.image,
    article: {
      publishedTime: news.publishedAt.toISOString(),
      modifiedTime: news.updatedAt.toISOString(),
    },
  });
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
  const jsonLd = newsArticleJsonLd({
    locale,
    url: absoluteUrl(localizedPath(`/media/news/${news.slug}`, locale)),
    headline: title,
    description: getDescription(news, locale),
    image: news.image,
    publishedAt: news.publishedAt,
    updatedAt: news.updatedAt,
  });

  return (
    <PageContainer size="narrow">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <BackLink href="/media/news" label={t("back_to_news")} className="mb-6" />

      <article>
        <header className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="type-small flex items-center gap-3 text-muted-foreground">
              <Badge variant="brand">{getNewsCategoryLabel(news.category, locale)}</Badge>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <time dateTime={news.publishedAt.toISOString()}>{formattedDate}</time>
              </span>
            </div>
            <ShareButton title={title} label={t("share")} />
          </div>
          <h1 className="type-h1 mt-5 text-foreground">{title}</h1>
        </header>

        {news.image && (
          <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-xl bg-secondary md:mt-10">
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

        <div
          className="prose prose-lg mx-auto mt-8 max-w-3xl md:mt-10
            prose-headings:font-heading prose-headings:text-foreground
            prose-p:text-foreground/85
            prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary-hover
            prose-strong:text-foreground
            prose-img:rounded-xl
            prose-figcaption:text-center prose-figcaption:text-muted-foreground [&_figcaption:empty]:hidden
            prose-blockquote:border-l-gold prose-blockquote:bg-secondary prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          "
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toNewsHtml(content), { ADD_ATTR: ["target"] }) }}
        />
      </article>
    </PageContainer>
  );
}
