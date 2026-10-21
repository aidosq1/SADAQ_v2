import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { NewsBlock } from "@/components/home/NewsBlock";
import { RankingWidget } from "@/components/home/RankingWidget";
import { MediaBlock } from "@/components/home/MediaBlock";
import { PartnersBlock } from "@/components/home/PartnersBlock";
import { getHeroSlides } from "@/lib/slides";

export default async function Home() {
  const t = await getTranslations("Hero");
  const slides = await getHeroSlides().catch((error) => {
    // Без слайдов с сервера слайдер сам загрузит их на клиенте
    console.error("Failed to load hero slides:", error);
    return undefined;
  });

  return (
    <main className="flex min-h-screen flex-col">
      <h1 className="sr-only">{t("title")}</h1>
      <Hero initialSlides={slides} />
      <NewsBlock />
      <RankingWidget />
      <MediaBlock />
      <PartnersBlock />
    </main>
  );
}
