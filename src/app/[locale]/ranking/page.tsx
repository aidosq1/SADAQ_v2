"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Minus,
  Search,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { KAZAKHSTAN_REGIONS } from "@/lib/constants";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations, useLocale } from "next-intl";

interface TeamMember {
  id: number;
  slug: string;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  type: string;
  gender: string;
  category: string;
  region: string;
  coachName?: string | null;
  image?: string | null;
}

interface RankingEntry {
  id: number;
  rank: number;
  previousRank?: number | null;
  points: number;
  classification?: string | null;
  season: string;
  teamMember: TeamMember;
}

function TrendIcon({ current, prev }: { current: number; prev: number | null | undefined }) {
  if (!prev) return <Minus className="h-4 w-4 text-gray-400" />;
  if (current < prev) return <ArrowUp className="h-4 w-4 text-green-500" />;
  if (current > prev) return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

function getLocalizedName(member: TeamMember, locale: string): string {
  if (locale === 'kk' && member.nameKk) return member.nameKk;
  if (locale === 'en' && member.nameEn) return member.nameEn;
  return member.name;
}

export default function RankingPage() {
  const t = useTranslations("RankingPage");
  const t_regions = useTranslations("Regions");
  const locale = useLocale();

  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>("Adults");
  const [filterGender, setFilterGender] = useState<string>("M");
  const [filterWeapon, setFilterWeapon] = useState<string>("Recurve");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("2025");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Athlete for Modal
  const [selectedRanking, setSelectedRanking] = useState<RankingEntry | null>(null);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const params = new URLSearchParams({
          season: filterPeriod,
          type: filterWeapon,
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
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [filterCategory, filterGender, filterWeapon, filterPeriod]);

  // Additional client-side filtering
  const filteredRankings = rankings
    .filter((r) => {
      if (filterRegion !== "all" && r.teamMember.region !== filterRegion) return false;
      if (searchQuery && !r.teamMember.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

      {/* Control Panel */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>{t("filter_age_category")}</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adults">{t("age_adults")}</SelectItem>
                  <SelectItem value="Youth">{t("age_youth")}</SelectItem>
                  <SelectItem value="Juniors">{t("age_juniors")}</SelectItem>
                  <SelectItem value="Cadets">{t("age_cadets")}</SelectItem>
                  <SelectItem value="Cubs">{t("age_cubs")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("filter_gender")}</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">{t("gender_male")}</SelectItem>
                  <SelectItem value="F">{t("gender_female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("filter_discipline")}</Label>
              <Select value={filterWeapon} onValueChange={setFilterWeapon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recurve">{t("disc_recurve")}</SelectItem>
                  <SelectItem value="Compound">{t("disc_compound")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("filter_region")}</Label>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_regions")}</SelectItem>
                  {KAZAKHSTAN_REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {t_regions(region.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("filter_period")}</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">{t("period_current")}</SelectItem>
                  <SelectItem value="2024">{t("period_archive_2024")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>{t("th_athlete")}</TableHead>
              <TableHead>{t("th_region")}</TableHead>
              <TableHead className="text-right">{t("th_points")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredRankings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">{t("no_data")}</TableCell>
              </TableRow>
            ) : (
              filteredRankings.map((ranking, index) => (
                <TableRow
                  key={ranking.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRanking(ranking)}
                >
                  <TableCell className="font-bold text-lg text-center">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center" title={t("trend_tooltip")}>
                      <TrendIcon current={index + 1} prev={ranking.previousRank} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={ranking.teamMember.image || undefined} alt={getLocalizedName(ranking.teamMember, locale)} />
                        <AvatarFallback>{ranking.teamMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {getLocalizedName(ranking.teamMember, locale)}
                        </span>
                        {ranking.classification && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                            {ranking.classification}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{t_regions(ranking.teamMember.region as never)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-primary">
                    {ranking.points}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                      <Link href={`/team/${ranking.teamMember.slug}`}>
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

      {/* Athlete Detail Dialog */}
      <Dialog open={!!selectedRanking} onOpenChange={(open) => !open && setSelectedRanking(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRanking && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-24 w-24 border-4 border-muted">
                    <AvatarImage src={selectedRanking.teamMember.image || undefined} alt={getLocalizedName(selectedRanking.teamMember, locale)} />
                    <AvatarFallback className="text-2xl">{selectedRanking.teamMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 pt-1">
                    <DialogTitle className="text-2xl font-bold">{getLocalizedName(selectedRanking.teamMember, locale)}</DialogTitle>
                    <DialogDescription className="text-base flex items-center gap-2">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t_regions(selectedRanking.teamMember.region as never)}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-bold text-primary">{t("rank_label")} #{selectedRanking.rank}</span>
                    </DialogDescription>
                    <div className="flex gap-2 pt-2">
                      <Badge variant="outline">{selectedRanking.classification || t("athlete_fallback")}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t("dialog_info_title")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">{t("dialog_coach")}</span>
                      <span className="font-medium text-primary">{selectedRanking.teamMember.coachName || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">{t("dialog_weapon")}</span>
                      <span className="font-medium">{selectedRanking.teamMember.type === "Recurve" ? t("disc_recurve") : t("disc_compound")}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">{t("dialog_category")}</span>
                      <span className="font-medium">
                        {selectedRanking.teamMember.category === "Adults" ? t("age_adults") :
                          selectedRanking.teamMember.category === "Youth" ? t("age_youth") :
                            selectedRanking.teamMember.category === "Juniors" ? t("age_juniors") :
                              selectedRanking.teamMember.category === "Cadets" ? t("age_cadets") :
                                selectedRanking.teamMember.category === "Cubs" ? t("age_cubs") : selectedRanking.teamMember.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t("dialog_history_title")}</h3>
                  <div className="h-[200px] w-full rounded-md border p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Янв', points: Math.round(selectedRanking.points * 0.8) },
                          { name: 'Фев', points: Math.round(selectedRanking.points * 0.85) },
                          { name: 'Мар', points: Math.round(selectedRanking.points * 0.9) },
                          { name: 'Апр', points: Math.round(selectedRanking.points * 0.95) },
                          { name: 'Май', points: selectedRanking.points },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          hide
                          domain={['dataMin - 100', 'dataMax + 100']}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="var(--primary)"
                          strokeWidth={3}
                          dot={{ fill: "var(--primary)", r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          animationDuration={2000}
                          animationEasing="ease-in-out"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`/team/${selectedRanking.teamMember.slug}`}>
                    {t("btn_full_profile")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
