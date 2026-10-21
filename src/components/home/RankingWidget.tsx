"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonPlaceholder } from "@/components/ui/person-placeholder";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { LoadingState } from "@/components/ui/states";
import { RankBadge } from "@/components/ui/rank-badge";
import { cardSurface } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RankingEntry {
  id: number;
  points: number;
  rank: number;
  position: number;
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
  const [error, setError] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings?limit=5');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRankings(data.data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const t = useTranslations("RankingPage");
  // Виджет показывает рейтинг по умолчанию: мужчины, классический лук, взрослые
  const topAthletesText = [t("gender_male"), t("disc_recurve"), t("age_adults")].join(" • ");

  if (loading) {
    return (
      <Section tone="muted">
        <LoadingState />
      </Section>
    );
  }

  if (error || rankings.length === 0) {
    return null;
  }

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow={topAthletesText}
        title={t("leaders_title")}
        action={<ArrowLink href="/ranking">{t("full_ranking")}</ArrowLink>}
      />

      <div className={`${cardSurface} overflow-hidden`}>
        <Table className="min-w-[360px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">№</TableHead>
              <TableHead>{t("th_athlete")}</TableHead>
              <TableHead className="text-right">{t("th_points")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((ranking) => (
              <TableRow key={ranking.id}>
                <TableCell>
                  <RankBadge position={ranking.position} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/team/${ranking.athlete.slug}`}
                    className="flex items-center gap-3 font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Avatar className="size-10 border">
                      <AvatarImage
                        src={ranking.athlete.image || undefined}
                        alt={getLocalizedName(ranking.athlete, locale)}
                      />
                      <AvatarFallback>
                        <PersonPlaceholder />
                      </AvatarFallback>
                    </Avatar>
                    <span className="whitespace-normal">{getLocalizedName(ranking.athlete, locale)}</span>
                  </Link>
                </TableCell>
                <TableCell className="type-number text-right text-lg text-primary">
                  {ranking.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}
