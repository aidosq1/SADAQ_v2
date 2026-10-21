import type { Prisma } from '@prisma/client';

// Наборы полей для открытого API. Всё, чего здесь нет (ИИН, медицинский допуск, допинг,
// дисквалификации, регистрационные данные, пользователи региона), отдаётся только после входа.

// Роли, которым видны полные карточки спортсменов, тренеров и судей
export const STAFF_ROLES = ['Admin', 'Editor', 'RegionalRepresentative'] as const;

export const PUBLIC_REGION_SELECT = {
  id: true,
  name: true,
  nameKk: true,
  nameEn: true,
} satisfies Prisma.RegionSelect;

// Спортсмен в списках: рейтинг, сборная, результаты
export const PUBLIC_ATHLETE_SELECT = {
  id: true,
  slug: true,
  name: true,
  nameKk: true,
  nameEn: true,
  gender: true,
  image: true,
  isActive: true,
  sortOrder: true,
  regionId: true,
  regionRef: { select: PUBLIC_REGION_SELECT },
} satisfies Prisma.AthleteSelect;

// Профиль спортсмена: дата рождения показывается на странице, плюс рейтинги и членство в сборной
export const PUBLIC_ATHLETE_PROFILE_SELECT = {
  ...PUBLIC_ATHLETE_SELECT,
  dob: true,
  sportsRank: true,
  rankings: { orderBy: { points: 'desc' } },
  nationalTeamMemberships: { where: { isActive: true } },
} satisfies Prisma.AthleteSelect;

// Тренер и судья без входа: имя, фото, регион
export const PUBLIC_PERSON_SELECT = {
  id: true,
  name: true,
  nameKk: true,
  nameEn: true,
  image: true,
  isActive: true,
  sortOrder: true,
  regionId: true,
  region: { select: PUBLIC_REGION_SELECT },
} satisfies Prisma.CoachSelect & Prisma.JudgeSelect;
