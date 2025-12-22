"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface RankingEntry {
  id: number;
  points: number;
  rank: number;
  athlete: {
    id: number;
    slug: string;
    name: string;
    nameKk?: string | null;
    nameEn?: string | null;
    type: string;
    image?: string | null;
  };
}

function getLocalizedName(item: RankingEntry['athlete'], locale: string): string {
  if (locale === 'kk' && item.nameKk) return item.nameKk;
  if (locale === 'en' && item.nameEn) return item.nameEn;
  return item.name;
}

export function RankingWidget() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings?limit=5');
        const data = await res.json();
        if (data.success && data.data) {
          setRankings(data.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const sectionTitle = locale === 'kk' ? 'Рейтинг көшбасшылары' : locale === 'en' ? 'Ranking Leaders' : 'Лидеры Рейтинга';
  const viewAllText = locale === 'kk' ? 'Толық рейтинг' : locale === 'en' ? 'Full Rankings' : 'Полный рейтинг';
  const topAthletesText = locale === 'kk' ? 'Ерлер • Классикалық • Ересектер' : locale === 'en' ? 'Men • Recurve • Adults' : 'Мужчины • Классический лук • Взрослые';

  if (loading) {
    return (
      <section className="py-16 bg-[hsl(var(--light-gray))]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--official-navy))] mx-auto" />
        </div>
      </section>
    );
  }

  if (rankings.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[hsl(var(--light-gray))]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-medium text-[hsl(var(--official-gold))] uppercase tracking-wider mb-2 block">
              {topAthletesText}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[hsl(var(--official-navy))] gold-accent">
              {sectionTitle}
            </h2>
          </div>
          <Link
            href="/ranking"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-blue))] hover:underline"
          >
            {viewAllText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg border border-[hsl(var(--border-light))] overflow-hidden mt-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border-light))] bg-[hsl(var(--light-gray))]">
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {locale === 'kk' ? 'Атлет' : locale === 'en' ? 'Athlete' : 'Атлет'}
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {locale === 'kk' ? 'Ұпай' : locale === 'en' ? 'Points' : 'Очки'}
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking) => (
                <tr
                  key={ranking.id}
                  className="border-b border-[hsl(var(--border-light))] last:border-b-0 hover:bg-[hsl(var(--light-gray))] transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      ranking.rank === 1 ? 'bg-[#FFD700] text-[hsl(var(--official-navy))]' :
                      ranking.rank === 2 ? 'bg-[#C0C0C0] text-[hsl(var(--official-navy))]' :
                      ranking.rank === 3 ? 'bg-[#CD7F32] text-white' :
                      'bg-[hsl(var(--light-gray))] text-[hsl(var(--official-navy))]'
                    }`}>
                      {ranking.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/team/${ranking.athlete.slug}`} className="flex items-center gap-3 hover:opacity-80">
                      <Avatar className="h-10 w-10 border border-[hsl(var(--border-light))]">
                        <AvatarImage
                          src={ranking.athlete.image || undefined}
                          alt={getLocalizedName(ranking.athlete, locale)}
                        />
                        <AvatarFallback className="text-sm bg-[hsl(var(--light-gray))]">
                          {ranking.athlete.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-[hsl(var(--official-navy))]">
                        {getLocalizedName(ranking.athlete, locale)}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-mono text-lg font-bold text-[hsl(var(--official-navy))]">
                      {ranking.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View All */}
        <div className="mt-6 md:hidden text-center">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-blue))]"
          >
            {viewAllText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
