"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { LoadingState } from "@/components/ui/states";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { cardInteractive, cardSurface } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LocalizedName {
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
}

interface RankingEntry {
  id: number;
  points: number;
  rank: number;
  position: number;
  athlete: LocalizedName & {
    id: number;
    slug: string;
    image?: string | null;
    regionRef?: LocalizedName | null;
  };
}

const LEADERS_LIMIT = 8;
const PODIUM_SIZE = 3;

// На широком экране первое место в центре и выше: 2 — 1 — 3
const PODIUM_ORDER: Record<number, string> = {
  1: "md:order-2",
  2: "md:order-1 md:mt-10",
  3: "md:order-3 md:mt-10",
};

function getLocalizedName(item: LocalizedName, locale: string): string {
  if (locale === 'kk' && item.nameKk) return item.nameKk;
  if (locale === 'en' && item.nameEn) return item.nameEn;
  return item.name;
}

function PodiumCard({ entry, locale, pointsLabel }: { entry: RankingEntry; locale: string; pointsLabel: string }) {
  const name = getLocalizedName(entry.athlete, locale);
  const region = entry.athlete.regionRef ? getLocalizedName(entry.athlete.regionRef, locale) : null;
  const leader = entry.position === 1;

  return (
    <Link
      href={`/team/${entry.athlete.slug}`}
      className={cn(
        cardSurface,
        cardInteractive,
        "group relative flex items-center gap-4 overflow-hidden p-5 md:flex-col md:p-6 md:text-center",
        leader && "border-gold/60",
        PODIUM_ORDER[entry.position]
      )}
    >
      {leader && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gold" />}
      <div className="relative shrink-0">
        <PersonAvatar src={entry.athlete.image} alt={name} className={cn("size-16", leader ? "md:size-28" : "md:size-24")} />
        <RankBadge position={entry.position} className="absolute -right-1 -bottom-1 ring-2 ring-background md:right-1" />
      </div>
      <div className="min-w-0 flex-1 md:flex-none">
        <p className="type-h4 line-clamp-2 transition-colors group-hover:text-primary">{name}</p>
        {region && <p className="type-small mt-0.5 truncate text-muted-foreground">{region}</p>}
      </div>
      <div className="shrink-0 text-right md:mt-2 md:text-center">
        <p className={cn("type-number leading-none", leader ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>
          {entry.points}
        </p>
        <p className="type-caption mt-1">{pointsLabel}</p>
      </div>
    </Link>
  );
}

function LeaderRow({ entry, locale }: { entry: RankingEntry; locale: string }) {
  const name = getLocalizedName(entry.athlete, locale);

  return (
    <li>
      <Link
        href={`/team/${entry.athlete.slug}`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60 md:px-5"
      >
        <RankBadge position={entry.position} />
        <PersonAvatar src={entry.athlete.image} alt={name} className="size-9" />
        <span className="min-w-0 flex-1 truncate font-medium transition-colors group-hover:text-primary">{name}</span>
        <span className="type-number text-base">{entry.points}</span>
      </Link>
    </li>
  );
}

export function RankingWidget() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const locale = useLocale();
  const t = useTranslations("RankingPage");

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch(`/api/rankings?limit=${LEADERS_LIMIT}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRankings(data.data);
        }
      } catch (err) {
        console.error('Failed to load rankings:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  // Виджет показывает рейтинг по умолчанию: мужчины, классический лук, взрослые
  const topAthletesText = [t("gender_male"), t("disc_recurve"), t("age_adults")].join(" · ");
  const pointsLabel = t("th_points");

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

  const podium = rankings.slice(0, PODIUM_SIZE);
  const rest = rankings.slice(PODIUM_SIZE);

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow={topAthletesText}
        title={t("leaders_title")}
        action={<ArrowLink href="/ranking">{t("full_ranking")}</ArrowLink>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-8">
          {podium.map((entry) => (
            <PodiumCard key={entry.id} entry={entry} locale={locale} pointsLabel={pointsLabel} />
          ))}
        </div>

        {rest.length > 0 && (
          <ol className={cn(cardSurface, "divide-y overflow-hidden lg:col-span-4")}>
            {rest.map((entry) => (
              <LeaderRow key={entry.id} entry={entry} locale={locale} />
            ))}
          </ol>
        )}
      </div>
    </Section>
  );
}
