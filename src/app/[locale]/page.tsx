import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { NewsBlock } from "@/components/home/NewsBlock";
import { RankingWidget } from "@/components/home/RankingWidget";
import { MediaBlock } from "@/components/home/MediaBlock";
import { PartnersBlock } from "@/components/home/PartnersBlock";

export default async function Home() {
  const t = await getTranslations("Hero");

  return (
    <main className="flex min-h-screen flex-col">
      <h1 className="sr-only">{t("title")}</h1>
      <Hero />
      <NewsBlock />
      <RankingWidget />
      <MediaBlock />
      <PartnersBlock />
    </main>
  );
}
