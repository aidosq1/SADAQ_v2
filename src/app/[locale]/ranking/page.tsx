"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, GENDERS, BOW_TYPES, DEFAULT_FILTERS, getLocalizedLabel } from "@/lib/constants";
import { useTranslations, useLocale } from "next-intl";

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

interface RankingEntry {
  id: number;
  rank: number;
  points: number;
  classification?: string | null;
  season: string;
  athlete: Athlete;
}

function getLocalizedName(athlete: Athlete, locale: string): string {
  if (locale === 'kk' && athlete.nameKk) return athlete.nameKk;
  if (locale === 'en' && athlete.nameEn) return athlete.nameEn;
  return athlete.name;
}

export default function RankingPage() {
  const t = useTranslations("RankingPage");
  const t_regions = useTranslations("Regions");
  const locale = useLocale();

  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>(DEFAULT_FILTERS.category);
  const [filterGender, setFilterGender] = useState<string>(DEFAULT_FILTERS.gender);
  const [filterType, setFilterType] = useState<string>(DEFAULT_FILTERS.type);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    async function fetchRankings() {
      try {
        const params = new URLSearchParams({
          season: '2026',
          type: filterType,
          gender: filterGender,
          category: filterCategory,
          limit: '100',
        });
        const res = await fetch(`/api/rankings?${params}`);
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
    })
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id)}
            >
              {getLocalizedLabel(cat, locale)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {GENDERS.map((g) => (
            <Button
              key={g.id}
              variant={filterGender === g.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterGender(g.id)}
            >
              {getLocalizedLabel(g, locale)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {BOW_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={filterType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type.id)}
            >
              {getLocalizedLabel(type, locale)}
            </Button>
          ))}
        </div>
      </div>

      {/* Search & Meta */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          {t("shown_label")}: {filteredRankings.length}
        </div>
      </div>

      {/* Ranking Grid */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px] text-center">{t("th_rank")}</TableHead>
              <TableHead>{t("th_athlete")}</TableHead>
              <TableHead>{t("th_region")}</TableHead>
              <TableHead className="text-right">{t("th_points")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredRankings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">{t("no_data")}</TableCell>
              </TableRow>
            ) : (
              filteredRankings.map((ranking, index) => (
                <TableRow
                  key={ranking.id}
                  className="group hover:bg-muted/50"
                >
                  <TableCell className="font-bold text-lg text-center">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={ranking.athlete.image || undefined} alt={getLocalizedName(ranking.athlete, locale)} />
                        <AvatarFallback>{ranking.athlete.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {getLocalizedName(ranking.athlete, locale)}
                        </span>
                        {ranking.classification && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                            {t(`classification_${ranking.classification}` as never)}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{(ranking.athlete as any).regionRef?.name || ranking.athlete.region || '—'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-primary">
                    {ranking.points}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                      <Link href={`/team/${ranking.athlete.slug}`}>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
