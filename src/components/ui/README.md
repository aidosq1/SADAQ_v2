# SADAQ UI kit

Один набор токенов и компонентов для публичного сайта и админки.
Токены — в `src/app/globals.css`, компоненты — в этой папке.
Витрина всех компонентов в dev-режиме: `http://localhost:3000/ui-kit` (в продакшене страницы нет).

## Шрифты

| Роль | Шрифт | Где |
|---|---|---|
| Заголовки, крупные цифры | Montserrat 600/700/800 | `h1–h6`, `type-display…type-h4`, `type-number` |
| Текст и интерфейс | Inter (variable) | всё остальное |

Оба шрифта поддерживают казахские буквы (`cyrillic-ext`). Подключаются в `src/app/[locale]/layout.tsx`
через `next/font`, переменные `--font-inter` и `--font-montserrat` висят на `<html>`.
`font-mono` — только для технических идентификаторов в админке (ключи, ИИН, номера заявок).

## Цвета

Используй только токены. Сырые `green-600`, `#7B1B1B`, `bg-[hsl(var(--…))]` запрещены.

| Токен | Назначение |
|---|---|
| `primary` / `primary-hover` / `primary-deep` | бордовый бренда: кнопки, ссылки, заголовки; наведение; тёмный конец градиента |
| `gold` | декор: черта под заголовком, точки слайдера, текст на бордовом фоне |
| `gold-strong` | золотой текст на светлом фоне (eyebrow, год в истории) |
| `secondary` / `muted` / `accent` | кремовый: фон секций, шапка таблиц, наведение в меню |
| `foreground` / `muted-foreground` | основной и второстепенный текст (оба проходят WCAG AA на белом и кремовом) |
| `border` / `input` | рамки карточек и полей |
| `success` `warning` `info` `destructive` (+ `-soft`) | статусы |
| `medal-gold` `medal-silver` `medal-bronze` | места 1–3 |

## Типографика

| Класс | Размер | Где |
|---|---|---|
| `type-display` | 36 → 48 → 60 | только hero «О федерации» |
| `type-h1` | 28 → 36 | заголовок страницы (через `PageHeader`) |
| `type-h2` | 24 → 30 | заголовок секции (через `SectionHeader`) |
| `type-h3` | 20 | подзаголовок внутри страницы, заголовок большой карточки |
| `type-h4` | 16 | заголовок карточки, название турнира в списке |
| `type-body` | 16 | абзацы |
| `type-small` | 14 | вторичный текст, мета-строки |
| `type-caption` | 12, muted | подписи, даты, размер файла |
| `type-eyebrow` | 12, uppercase | надзаголовок, шапки колонок |
| `type-number` | — | цифры: очки, статистика (табличные цифры) |

Текст меньше 12px не используем. `cn()` знает про `type-*`: `cn("text-sm font-medium", "type-h3")` оставит только `type-h3`.

## Сетка и отступы

- Ширина контента — `Container` (`max-w-7xl`, поля 16/24/32px). Узкие страницы (статья, история, форма заявки) — `size="narrow"` (`max-w-4xl`).
- Страница — `PageContainer`: `py-8 md:py-12`.
- Блок главной — `Section`: `py-12 md:py-16`, `tone="muted"` для кремового фона. Кремовый и белый чередуются.
- Радиусы: поля и кнопки `rounded-md` (6px), карточки `rounded-lg` (8px), чипы/бейджи/аватары `rounded-full`.
- Тени: карточки плоские (только рамка). Тень — на наведении (`Card interactive`) и у всплывающих слоёв.

## Компоненты

| Компонент | Файл | Когда |
|---|---|---|
| `Container`, `PageContainer` | `container.tsx` | обёртка любой страницы |
| `PageHeader`, `BackLink` | `page-header.tsx` | h1 страницы + действия справа; ссылка «назад» |
| `Section`, `SectionHeader` | `section.tsx` | блоки главной, заголовок секции с золотой чертой и ссылкой «Все …» |
| `ArrowLink` | `arrow-link.tsx` | «Все новости →», «Подробнее →» |
| `Button` | `button.tsx` | `default`, `secondary`, `outline`, `ghost`, `link`, `success`, `destructive`; размеры `sm` 36, `default` 40, `lg` 44 |
| `Badge` | `badge.tsx` | `brand` — плашка на фото; `success/warning/info/neutral/destructive` — статусы |
| `Chip`, `ChipGroup` | `chip.tsx` | фильтры и переключатели (рейтинг, сборная, календарь, галерея, категории турнира) |
| `Card` (`interactive`), `cardSurface` | `card.tsx` | карточки; `cardSurface` + `cardInteractive` — для `<Link>` |
| `MediaCard` | `media-card.tsx` | новость, альбом: фото 16:10, бейдж, дата, заголовок |
| `PersonAvatar` | `person-avatar.tsx` | фото человека с единой заглушкой; `shape="portrait"` для президента |
| `RankBadge` | `rank-badge.tsx` | место в рейтинге и результатах |
| `Stat`, `IconTile` | `stat.tsx`, `icon-tile.tsx` | цифры федерации, иконка в кремовом круге |
| `MetricCard` | `metric-card.tsx` | счётчики в админке |
| `LoadingState`, `EmptyState` | `states.tsx` | загрузка и «нет данных» вместо текста «Loading…» |
| `AthleteFilters` | `../filters/AthleteFilters.tsx` | фильтры возраст/пол/лук для рейтинга и сборной |

Статусы: турнир — `getStatusVariant()` из `src/lib/tournament-utils.ts`, заявка — `getRegistrationStatus()` из `src/lib/registration-status.ts`.

## Правила текста в интерфейсе

Только заголовок, сами данные и кнопка действия. Без подзаголовков-пояснений под h1
и без второстепенных подписей под строкой.
