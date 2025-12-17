import { Hero } from "@/components/home/Hero";
import { HeroNewsSlider } from "@/components/home/HeroNewsSlider";
import { CalendarWidget } from "@/components/home/CalendarWidget";
import { NewsBlock } from "@/components/home/NewsBlock";
import { RankingWidget } from "@/components/home/RankingWidget";
import { MediaBlock } from "@/components/home/MediaBlock";
import { PartnersBlock } from "@/components/home/PartnersBlock";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <CalendarWidget />
        </div>
        <div className="lg:col-span-2">
          <MediaBlock />
        </div>
      </section>


      <PartnersBlock />
    </main >
  );
}
