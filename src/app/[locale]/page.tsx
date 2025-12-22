import { Hero } from "@/components/home/Hero";
import { NewsBlock } from "@/components/home/NewsBlock";
import { RankingWidget } from "@/components/home/RankingWidget";
import { MediaBlock } from "@/components/home/MediaBlock";
import { PartnersBlock } from "@/components/home/PartnersBlock";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <NewsBlock />
      <RankingWidget />
      <MediaBlock />
      <PartnersBlock />
    </main>
  );
}
