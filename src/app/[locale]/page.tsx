import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { NewsBlock } from "@/components/home/NewsBlock";
import { RankingWidget } from "@/components/home/RankingWidget";
import { MediaBlock } from "@/components/home/MediaBlock";
import { PartnersBlock } from "@/components/home/PartnersBlock";
import { getHeroSlides } from "@/lib/slides";
import { SOCIAL_LINKS } from "@/components/layout/nav";
import { absoluteUrl, buildPageMetadata, localizedPath, pageDescription } from "@/lib/seo";
import { organizationJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/structured-data";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });
  return buildPageMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: pageDescription("/", locale),
    absoluteTitle: true,
  });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Hero");
  const slides = await getHeroSlides().catch((error) => {
    // Без слайдов с сервера слайдер сам загрузит их на клиенте
    console.error("Failed to load hero slides:", error);
    return undefined;
  });

  const jsonLd = [
    organizationJsonLd(locale, [SOCIAL_LINKS.instagram]),
    websiteJsonLd(locale, absoluteUrl(localizedPath("/", locale))),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <h1 className="sr-only">{t("title")}</h1>
      <Hero initialSlides={slides} />
      <NewsBlock />
      <RankingWidget />
      <MediaBlock />
      <PartnersBlock />
    </>
  );
}
