import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, CheckCircle, Clock, MapPin, Trophy, Users, XCircle } from "lucide-react";

import { ArrowLink } from "@/components/ui/arrow-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { PageContainer } from "@/components/ui/container";
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

export const metadata: Metadata = {
  title: "UI kit",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "primary", className: "bg-primary" },
  { name: "primary-hover", className: "bg-primary-hover" },
  { name: "primary-deep", className: "bg-primary-deep" },
  { name: "gold", className: "bg-gold" },
  { name: "gold-strong", className: "bg-gold-strong" },
  { name: "secondary", className: "bg-secondary" },
  { name: "foreground", className: "bg-foreground" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "border", className: "bg-border" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "info", className: "bg-info" },
  { name: "destructive", className: "bg-destructive" },
];

const TYPE_SCALE = [
  { name: "type-display", className: "type-display text-primary" },
  { name: "type-h1", className: "type-h1 text-primary" },
  { name: "type-h2", className: "type-h2 text-primary" },
  { name: "type-h3", className: "type-h3 text-primary" },
  { name: "type-h4", className: "type-h4 text-foreground" },
  { name: "type-body", className: "type-body" },
  { name: "type-small", className: "type-small" },
  { name: "type-caption", className: "type-caption" },
  { name: "type-eyebrow", className: "type-eyebrow text-gold-strong" },
];

function KitBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-8">
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
    <PageContainer className="space-y-10">
      <PageHeader title="UI kit" back={{ href: "/", label: "Главная" }} className="mb-0 md:mb-0" />

      <KitBlock title="Цвета">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {COLORS.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`h-14 rounded-md border ${color.className}`} />
              <p className="type-caption">{color.name}</p>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Типографика: Montserrat — заголовки, Inter — текст">
        <div className="space-y-4">
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
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
        <ArrowLink href="/media/news">Все новости</ArrowLink>
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
        <ChipGroup>
          <Chip active>Взрослые</Chip>
          <Chip>Молодёжь</Chip>
          <Chip>Юниоры</Chip>
        </ChipGroup>
        <Input placeholder="Поиск спортсмена" className="max-w-sm" />
      </KitBlock>

      <KitBlock title="Заголовок секции">
        <SectionHeader
          eyebrow="Мужчины • Классический лук • Взрослые"
          title="Лидеры рейтинга"
          action={<ArrowLink href="/ranking">Полный рейтинг</ArrowLink>}
        />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MapPin className="size-5" />
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
          <Card interactive className="px-6">
            <Stat icon={Users} value="1500+" label="Активные спортсмены" />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <MetricCard label="Всего" value={42} icon={Users} />
          <MetricCard label="На проверке" value={5} icon={Clock} tone="warning" />
          <MetricCard label="Одобрено" value={34} icon={CheckCircle} tone="success" />
          <MetricCard label="Отклонено" value={3} icon={XCircle} tone="destructive" />
        </div>
        <div className="flex gap-3">
          <IconTile icon={Trophy} size="sm" />
          <IconTile icon={Trophy} />
          <IconTile icon={Trophy} size="lg" />
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
