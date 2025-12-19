"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLocale, useTranslations } from "next-intl";

interface RankingEntry {
  id: number;
  points: number;
  rank: number;
  teamMember: {
    id: number;
    name: string;
    nameKk?: string | null;
    nameEn?: string | null;
    type: string;
    image?: string | null;
  };
}

function getLocalizedName(item: RankingEntry['teamMember'], locale: string): string {
  if (locale === 'kk' && item.nameKk) return item.nameKk;
  if (locale === 'en' && item.nameEn) return item.nameEn;
  return item.name;
}

function getLocalizedType(type: string, locale: string): string {
  const typeMap: Record<string, Record<string, string>> = {
    Recurve: { ru: 'Классический', kk: 'Классикалық', en: 'Recurve' },
    Compound: { ru: 'Блочный', kk: 'Блоктық', en: 'Compound' },
  };
  return typeMap[type]?.[locale] || type;
}

export function RankingWidget() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations("RankingWidget");

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings?limit=5');
        const data = await res.json();
        if (data.success && data.data) {
          setRankings(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const sectionTitle = locale === 'kk' ? 'Рейтинг көшбасшылары' : locale === 'en' ? 'Ranking Leaders' : 'Лидеры Рейтинга';

  if (loading) {
    return (
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">{sectionTitle}</h2>
          <div className="flex justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  if (rankings.length === 0) {
    console.log("RankingWidget: No rankings found");
    return (
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">{sectionTitle}</h2>
          <div className="text-center">Нет данных рейтинга</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">{sectionTitle}</h2>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {rankings.map((ranking) => (
              <CarouselItem key={ranking.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="bg-white/60 backdrop-blur-md shadow-lg border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                          <AvatarImage src={ranking.teamMember.image || undefined} alt={getLocalizedName(ranking.teamMember, locale)} />
                          <AvatarFallback>{ranking.teamMember.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-background shadow-sm">
                          {ranking.rank}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg">{getLocalizedName(ranking.teamMember, locale)}</h3>
                      <p className="text-sm text-muted-foreground">{getLocalizedType(ranking.teamMember.type, locale)}</p>
                      <div className="mt-4 font-mono text-2xl font-bold text-primary">
                        {ranking.points} <span className="text-xs font-normal text-muted-foreground">pts</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
