import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, CheckCircle, Clock, MapPin, Search, Trophy, Users, XCircle } from "lucide-react";

import { ArrowLink } from "@/components/ui/arrow-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { PageContainer } from "@/components/ui/container";
import { DateTile } from "@/components/ui/date-tile";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { MediaCard } from "@/components/ui/media-card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { SectionHeader } from "@/components/ui/section";
import { Stat } from "@/components/ui/stat";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KitSegmented } from "./KitSegmented";

export const metadata: Metadata = {
  title: "UI kit",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "primary", className: "bg-primary" },
  { name: "primary-hover", className: "bg-primary-hover" },
  { name: "primary-deep", className: "bg-primary-deep" },
  { name: "primary-soft", className: "bg-primary-soft" },
  { name: "gold", className: "bg-gold" },
  { name: "gold-strong", className: "bg-gold-strong" },
  { name: "foreground", className: "bg-foreground" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "secondary", className: "bg-secondary" },
  { name: "accent", className: "bg-accent" },
  { name: "border", className: "bg-border" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "info", className: "bg-info" },
  { name: "destructive", className: "bg-destructive" },
];

const TYPE_SCALE = [
  { name: "type-display", className: "type-display" },
  { name: "type-h1", className: "type-h1" },
  { name: "type-h2", className: "type-h2" },
  { name: "type-h3", className: "type-h3" },
  { name: "type-h4", className: "type-h4" },
  { name: "type-lead", className: "type-lead text-muted-foreground" },
  { name: "type-body", className: "type-body" },
  { name: "type-small", className: "type-small" },
  { name: "type-caption", className: "type-caption" },
  { name: "type-eyebrow", className: "type-eyebrow text-gold-strong" },
];

const RANKING = [
  { position: 1, name: "БЕРЧА Иван", region: "г. Шымкент", points: 1046 },
  { position: 2, name: "ЖАҢБЫРБАЙ Дәулеткелді", region: "Жетысуская область", points: 1011 },
  { position: 3, name: "ЕРЕМЕНКО Александр", region: "Жетысуская область", points: 997 },
  { position: 4, name: "ЕРЖАНУЛЫ Санжар", region: "Жетысуская область", points: 976 },
];

function KitBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border-t pt-10">
      <h2 className="type-eyebrow text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

// Витрина UI kit для разработки. В продакшене страницы нет
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <PageContainer className="space-y-12">
      <PageHeader
        title="UI kit"
        eyebrow="SADAQ · дизайн-система"
        back={{ href: "/", label: "Главная" }}
       
      />

      <KitBlock title="Цвета">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
          {COLORS.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`h-14 rounded-lg ring-1 ring-border ring-inset ${color.className}`} />
              <p className="type-caption">{color.name}</p>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Типографика: Montserrat — заголовки и цифры, Inter — текст">
        <div className="space-y-5">
          {TYPE_SCALE.map((item) => (
            <div key={item.name} className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
              <code className="type-caption w-32 shrink-0">{item.name}</code>
              <p className={item.className}>Қазақстан садақ ату федерациясы</p>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Кнопки">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Подать заявку</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="success">Одобрить</Button>
          <Button variant="destructive">Удалить</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small 36</Button>
          <Button>Default 40</Button>
          <Button size="lg">Large 48</Button>
          <ArrowLink href="/media/news">Все новости</ArrowLink>
        </div>
        <div className="surface-inverse flex flex-wrap items-center gap-3 rounded-xl p-6">
          <Button variant="inverse" size="lg">Календарь</Button>
          <Button variant="inverse-outline" size="lg">Рейтинг</Button>
          <Badge variant="inverse">Новости</Badge>
          <ArrowLink href="/media/news" tone="inverse">Подробнее</ArrowLink>
        </div>
      </KitBlock>

      <KitBlock title="Бейджи и статусы">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="brand">Сборная</Badge>
          <Badge variant="success">Регистрация открыта</Badge>
          <Badge variant="warning">На проверке</Badge>
          <Badge variant="info">Идёт турнир</Badge>
          <Badge variant="neutral">Завершён</Badge>
          <Badge variant="destructive">Отклонено</Badge>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 12].map((position) => (
            <RankBadge key={position} position={position} />
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Фильтры и поля">
        <div className="flex flex-wrap items-center gap-3">
          <KitSegmented />
          <ChipGroup>
            <Chip active>Взрослые</Chip>
            <Chip>Молодёжь</Chip>
            <Chip>Юниоры</Chip>
          </ChipGroup>
        </div>
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск спортсмена" className="pl-10" />
        </div>
      </KitBlock>

      <KitBlock title="Заголовки секций">
        <SectionHeader
          eyebrow="Мужчины · Классический лук · Взрослые"
          title="Лидеры рейтинга"
          action={<ArrowLink href="/ranking">Полный рейтинг</ArrowLink>}
        />
        <div className="surface-inverse rounded-xl p-8">
          <SectionHeader tone="inverse" eyebrow="Федерация" title="В цифрах" className="mb-8 md:mb-8" />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat tone="inverse" value="12" label="Регионов и филиалов" />
            <Stat tone="inverse" value="1500+" label="Активных спортсменов" />
            <Stat tone="inverse" value="40+" label="Тренеров и судей" />
            <Stat tone="inverse" value="1967" label="Год основания" />
          </div>
        </div>
      </KitBlock>

      <KitBlock title="Карточки">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MediaCard
            href="/media/news"
            title="Кубок Азии по стрельбе из лука пройдёт в Ираке"
            badge={<Badge variant="brand">Новости</Badge>}
            meta={
              <>
                <Calendar className="size-3.5" />
                21 октября 2026 г.
              </>
            }
            excerpt="С 24 по 29 октября 2026 года в городе Сулеймания пройдёт второй этап Кубка Азии."
          />
          <MediaCard
            variant="overlay"
            href="/media/gallery"
            title="Чемпионат Республики Казахстан 2026"
            badge={<Badge variant="inverse">Фотоальбом</Badge>}
            meta="48 фото"
            aspect="aspect-auto"
          />
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  г. Астана
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <PersonAvatar alt="Спортсмен" className="size-12" />
                <div>
                  <p className="font-semibold">БЕРЧА Иван</p>
                  <p className="type-small text-muted-foreground">Карагандинская область</p>
                </div>
              </CardContent>
            </Card>
            <Card interactive className="flex-row items-center gap-4 px-5 py-5">
              <DateTile date="2026-11-12" locale="ru" />
              <div className="min-w-0">
                <p className="type-h4 line-clamp-2">Кубок Республики Казахстан</p>
                <p className="type-small mt-1 text-muted-foreground">12–17 ноября · Шымкент</p>
              </div>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <MetricCard label="Всего" value={42} icon={Users} />
          <MetricCard label="На проверке" value={5} icon={Clock} tone="warning" />
          <MetricCard label="Одобрено" value={34} icon={CheckCircle} tone="success" />
          <MetricCard label="Отклонено" value={3} icon={XCircle} tone="destructive" />
        </div>
        <div className="flex items-center gap-3">
          <IconTile icon={Trophy} size="sm" />
          <IconTile icon={Trophy} />
          <IconTile icon={Trophy} size="lg" />
          <Eyebrow className="ml-4">Надзаголовок</Eyebrow>
        </div>
      </KitBlock>

      <KitBlock title="Таблица">
        <div className="overflow-hidden rounded-lg border shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Место</TableHead>
                <TableHead>Спортсмен</TableHead>
                <TableHead className="hidden md:table-cell">Регион</TableHead>
                <TableHead className="text-right">Очки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RANKING.map((row) => (
                <TableRow key={row.position}>
                  <TableCell>
                    <RankBadge position={row.position} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 font-medium">
                      <PersonAvatar alt={row.name} className="size-9" />
                      {row.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{row.region}</TableCell>
                  <TableCell className="type-number text-right text-base">{row.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </KitBlock>

      <KitBlock title="Состояния">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <EmptyState icon={Trophy} title="Нет данных" />
          <LoadingState className="min-h-[160px] rounded-lg border" />
        </div>
      </KitBlock>
    </PageContainer>
  );
}
