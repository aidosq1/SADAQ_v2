"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { cardInteractive, cardSurface } from "@/components/ui/card";
import { AthleteFilters, type AthleteFilterKey } from "@/components/filters/AthleteFilters";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Search, Trophy } from "lucide-react";
import { Link, useRouter } from "@/navigation";
import { startNavigationProgress } from "@/components/layout/NavigationProgress";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { rankingsQuery } from "@/lib/ranking-query";
import { useTranslations, useLocale } from "next-intl";
import { getRegionName } from "@/lib/localization";

interface Athlete {
  id: number;
  slug: string;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  type: string;
  gender: string;
  category: string;
  region: string;
  image?: string | null;
}

export interface RankingEntry {
  id: number;
  rank: number;
  position: number;
  points: number;
  season: string;
  athlete: Athlete;
}

function getLocalizedName(athlete: Athlete, locale: string): string {
  if (locale === 'kk' && athlete.nameKk) return athlete.nameKk;
  if (locale === 'en' && athlete.nameEn) return athlete.nameEn;
  return athlete.name;
}

interface RankingViewProps {
  // Рейтинг по фильтрам по умолчанию, загруженный на сервере
  initialRankings?: RankingEntry[];
}

export default function RankingView({ initialRankings }: RankingViewProps) {
  const t = useTranslations("RankingPage");
  const t_regions = useTranslations("Regions");
  const locale = useLocale();
  const router = useRouter();

  const [rankings, setRankings] = useState<RankingEntry[]>(initialRankings ?? []);
  const [loading, setLoading] = useState(!initialRankings);
  // Данные для фильтров по умолчанию уже есть — первый запуск эффекта пропускаем
  const skipFirstFetch = useRef(Boolean(initialRankings));

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>(DEFAULT_FILTERS.category);
  const [filterGender, setFilterGender] = useState<string>(DEFAULT_FILTERS.gender);
  const [filterType, setFilterType] = useState<string>(DEFAULT_FILTERS.type);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    async function fetchRankings() {
      try {
        const query = rankingsQuery({ category: filterCategory, gender: filterGender, type: filterType });
        const res = await fetch(`/api/rankings?${query}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRankings(data.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [filterCategory, filterGender, filterType]);

  // Additional client-side filtering
  const filteredRankings = rankings
    .filter((r) => {
      if (searchQuery && !r.athlete.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

  const setters: Record<AthleteFilterKey, (value: string) => void> = {
    category: setFilterCategory,
    gender: setFilterGender,
    type: setFilterType,
  };

  const emptyState = <EmptyState icon={Trophy} title={t("no_data")} />;

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      <div className="space-y-6">
        <AthleteFilters
          category={filterCategory}
          gender={filterGender}
          type={filterType}
          locale={locale}
          onChange={(key, value) => setters[key](value)}
        />

        {/* Search & Meta */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search_placeholder")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="type-small hidden shrink-0 text-muted-foreground md:block">
            {t("shown_label")}: {filteredRankings.length}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredRankings.length === 0 ? (
          emptyState
        ) : (
          <>
            {/* Mobile Card View */}
            <ul className="space-y-3 md:hidden">
              {filteredRankings.map((ranking) => (
                <li key={ranking.id}>
                  <Link
                    href={`/team/${ranking.athlete.slug}`}
                    className={cn(cardSurface, cardInteractive, "flex items-center gap-3 p-4")}
                  >
                    <RankBadge position={ranking.position} />
                    <PersonAvatar
                      src={ranking.athlete.image}
                      alt={getLocalizedName(ranking.athlete, locale)}
                      className="size-12"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{getLocalizedName(ranking.athlete, locale)}</p>
                      <p className="type-small truncate text-muted-foreground">
                        {getRegionName(ranking.athlete, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="type-number text-lg">{ranking.points}</p>
                      <p className="type-caption">{t("th_points")}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Table View */}
            <div className={cn(cardSurface, "hidden overflow-hidden md:block")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 text-center">{t("th_rank")}</TableHead>
                    <TableHead>{t("th_athlete")}</TableHead>
                    <TableHead>{t("th_region")}</TableHead>
                    <TableHead className="text-right">{t("th_points")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRankings.map((ranking) => (
                    <TableRow
                      key={ranking.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        startNavigationProgress();
                        router.push(`/team/${ranking.athlete.slug}`);
                      }}
                    >
                      <TableCell className="text-center">
                        <RankBadge position={ranking.position} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/team/${ranking.athlete.slug}`}
                          className="flex items-center gap-3 font-semibold text-foreground transition-colors group-hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PersonAvatar
                            src={ranking.athlete.image}
                            alt={getLocalizedName(ranking.athlete, locale)}
                            className="size-10"
                          />
                          {getLocalizedName(ranking.athlete, locale)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getRegionName(ranking.athlete, locale)}</TableCell>
                      <TableCell className="type-number text-right text-lg">
                        {ranking.points}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
