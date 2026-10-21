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
| `primary` / `primary-hover` | бордовый бренда: кнопки, ссылки, активные состояния. Не для заголовков и цифр |
| `primary-deep` | тёмная поверхность бренда: hero, футер, тёмные карточки (`surface-inverse`) |
| `primary-soft` | мягкая бордовая подложка: иконки, плитка даты, выбранный пункт меню |
| `gold` | декор: черта надзаголовка, прогресс слайдера, текст и цифры на тёмном |
| `gold-strong` | золотой текст на светлом фоне (надзаголовок, год в истории) |
| `secondary` / `muted` / `accent` | тёплый светлый: фон секций, шапка таблиц, наведение |
| `foreground` / `muted-foreground` | тёплый почти чёрный — текст **и заголовки**; второстепенный текст (оба AA) |
| `border` / `input` | рамки карточек и полей |
| `success` `warning` `info` `destructive` (+ `-soft`) | статусы |
| `medal-gold` `medal-silver` `medal-bronze` | места 1–3 |

## Типографика

| Класс | Размер | Где |
|---|---|---|
| `type-display` | 40 → 56 → 68 | hero «О федерации», 404 |
| `type-h1` | 32 → 44 | заголовок страницы (через `PageHeader`), заголовок слайда |
| `type-h2` | 26 → 36 | заголовок секции (через `SectionHeader`) |
| `type-h3` | 20 | подзаголовок внутри страницы, заголовок большой карточки |
| `type-h4` | 16 | заголовок карточки, название турнира в списке |
| `type-lead` | 17 → 19 | вводный абзац: hero, миссия, описание |
| `type-body` | 16 | абзацы |
| `type-small` | 14 | вторичный текст, мета-строки |
| `type-caption` | 12, muted | подписи, даты, размер файла |
| `type-eyebrow` | 12, uppercase | надзаголовок, шапки колонок |
| `type-number` | — | цифры: очки, статистика (табличные цифры) |

Текст меньше 12px не используем. `cn()` знает про `type-*`: `cn("text-sm font-medium", "type-h3")` оставит только `type-h3`.

## Сетка и отступы

- Ширина контента — `Container` (`max-w-7xl`, поля 16/24/32px). Узкие страницы (статья, история, форма заявки) — `size="narrow"` (`max-w-4xl`).
- Страница — `PageContainer`: `py-8 md:py-12`.
- Блок главной — `Section`: `py-14 md:py-20`; `tone="muted"` — тёплый фон, `tone="inverse"` — тёмный бренд.
- Радиусы: поля и кнопки `rounded-md` (10px), карточки `rounded-lg` (12px), фото и тёмные карточки `rounded-xl`/`rounded-2xl`, чипы/бейджи/аватары `rounded-full`.
- Тени: `shadow-card` — карточки в покое, `shadow-raised` — наведение (`Card interactive` ещё и приподнимается на 2px), всплывающие слои, плашки поверх hero.

## Компоненты

| Компонент | Файл | Когда |
|---|---|---|
| `Container`, `PageContainer` | `container.tsx` | обёртка любой страницы |
| `PageHeader`, `BackLink` | `page-header.tsx` | h1 страницы + действия справа; ссылка «назад» |
| `Section`, `SectionHeader` | `section.tsx` | блоки главной (`tone`: default / muted / inverse), заголовок секции с надзаголовком и ссылкой «Все …» |
| `Eyebrow` | `eyebrow.tsx` | надзаголовок с золотой чертой над h1/h2, роль человека, «Ближайший старт» |
| `ArrowLink` | `arrow-link.tsx` | «Все новости →», «Подробнее →» |
| `Button` | `button.tsx` | `default`, `secondary`, `outline`, `ghost`, `link`, `success`, `destructive`; на тёмном — `inverse`, `inverse-outline`; размеры `sm` 36, `default` 40, `lg` 48 |
| `Badge` | `badge.tsx` | `brand` — плашка на фото; `inverse` — на тёмном; `success/warning/info/neutral/destructive` — статусы |
| `Chip`, `ChipGroup` | `chip.tsx` | фильтр с многими вариантами: возраст, категории турнира, альбомы |
| `Segmented` | `segmented.tsx` | 2–4 взаимоисключающих варианта: пол, тип лука, предстоящие/прошедшие |
| `DateTile` | `date-tile.tsx` | дата старта плиткой: календарь, ближайший турнир |
| `Card` (`interactive`), `cardSurface` | `card.tsx` | карточки; `cardSurface` + `cardInteractive` — для `<Link>` |
| `MediaCard` | `media-card.tsx` | `stacked` — карточка новости; `overlay` — текст на фото (главная новость, альбомы, `size="sm"` для мелких плиток); `row` — миниатюра + заголовок в списке |
| `PersonAvatar` | `person-avatar.tsx` | фото человека с единой заглушкой; `shape="portrait"` для президента |
| `RankBadge` | `rank-badge.tsx` | место: 1–3 медальный круг, дальше просто число |
| `Stat`, `IconTile` | `stat.tsx`, `icon-tile.tsx` | цифры федерации (`tone="inverse"` на тёмном); иконка на мягкой подложке |
| `MetricCard` | `metric-card.tsx` | счётчики в админке |
| `LoadingState`, `EmptyState` | `states.tsx` | загрузка и «нет данных» вместо текста «Loading…» |
| `AthleteFilters` | `../filters/AthleteFilters.tsx` | фильтры возраст/пол/лук для рейтинга и сборной |

Статусы: турнир — `getStatusVariant()` из `src/lib/tournament-utils.ts`, заявка — `getRegistrationStatus()` из `src/lib/registration-status.ts`.

## Правила текста в интерфейсе

Только заголовок, сами данные и кнопка действия. Без подзаголовков-пояснений под h1
и без второстепенных подписей под строкой.

## Цвет и иерархия

- Заголовки, имена, очки и цифры — `foreground`. Бордовый — только то, на что можно нажать, и активное состояние.
- Акцентная страница или блок — тёмная поверхность `surface-inverse`: hero главной и «О федерации», цифры федерации, президент, профиль спортсмена, шапка турнира, футер, 404.
- Поверх фото текст кладём на затемнение (`scrim-bottom` или градиент из `primary-deep`).
