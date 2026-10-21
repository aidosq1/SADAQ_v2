// Создание и правка турнира: разбор тела запроса и удаление категорий
import { Prisma } from '@prisma/client';
import { CATEGORIES, GENDERS, BOW_TYPES } from '@/lib/constants';
import { parseDateInput } from '@/lib/tournament-input';

export class TournamentInputError extends Error {}
export class TournamentConflictError extends Error {}

export interface CategoryInput {
  category: string;
  gender: string;
  type: string;
}

export interface TournamentFields {
  title?: string;
  titleKk?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  location?: string;
  locationKk?: string | null;
  locationEn?: string | null;
  regulationUrl?: string | null;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date | null;
  isRegistrationOpen?: boolean;
  isFeatured?: boolean;
  organizingRegionId?: number | null;
}

const REQUIRED_TEXT_FIELDS = ['title', 'location'] as const;
const OPTIONAL_TEXT_FIELDS = [
  'titleKk', 'titleEn',
  'description', 'descriptionKk', 'descriptionEn',
  'locationKk', 'locationEn',
  'regulationUrl',
] as const;
const BOOLEAN_FIELDS = ['isRegistrationOpen', 'isFeatured'] as const;

const ACTIVE_REGISTRATION_STATUSES: ('PENDING' | 'APPROVED')[] = ['PENDING', 'APPROVED'];
const INACTIVE_REGISTRATION_STATUSES: ('REJECTED' | 'WITHDRAWN')[] = ['REJECTED', 'WITHDRAWN'];

function readRequiredDate(body: Record<string, unknown>, field: 'startDate' | 'endDate'): Date | undefined {
  const date = parseDateInput(body[field]);
  if (date === null) {
    throw new TournamentInputError('Даты начала и окончания обязательны');
  }
  return date;
}

function readRegionId(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const regionId = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isInteger(regionId)) {
    throw new TournamentInputError('Некорректный регион-организатор');
  }
  return regionId;
}

// Берёт из тела запроса только поля турнира; отсутствующее поле не меняется
export function pickTournamentFields(body: Record<string, unknown>): TournamentFields {
  const fields: Record<string, unknown> = {};

  for (const field of REQUIRED_TEXT_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || !value.trim()) {
      throw new TournamentInputError('Название и место проведения обязательны');
    }
    fields[field] = value.trim();
  }

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (value !== null && typeof value !== 'string') {
      throw new TournamentInputError(`Некорректное поле ${field}`);
    }
    fields[field] = value ? value : null;
  }

  for (const field of BOOLEAN_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'boolean') {
      throw new TournamentInputError(`Некорректное поле ${field}`);
    }
    fields[field] = value;
  }

  const startDate = readRequiredDate(body, 'startDate');
  const endDate = readRequiredDate(body, 'endDate');
  const registrationDeadline = parseDateInput(body.registrationDeadline);
  const organizingRegionId = readRegionId(body.organizingRegionId);

  return {
    ...(fields as TournamentFields),
    ...(startDate !== undefined && { startDate }),
    ...(endDate !== undefined && { endDate }),
    ...(registrationDeadline !== undefined && { registrationDeadline }),
    ...(organizingRegionId !== undefined && { organizingRegionId }),
  };
}

const isKnown = (list: ReadonlyArray<{ id: string }>, value: unknown) =>
  typeof value === 'string' && list.some((item) => item.id === value);

export const isSameCategory = (a: CategoryInput, b: CategoryInput) =>
  a.category === b.category && a.gender === b.gender && a.type === b.type;

export function parseCategories(value: unknown): CategoryInput[] {
  if (!Array.isArray(value)) {
    throw new TournamentInputError('Некорректный список категорий');
  }

  const categories: CategoryInput[] = [];
  for (const item of value) {
    const { category, gender, type } = (item ?? {}) as Record<string, unknown>;
    if (!isKnown(CATEGORIES, category) || !isKnown(GENDERS, gender) || !isKnown(BOW_TYPES, type)) {
      throw new TournamentInputError('Неизвестная категория турнира');
    }
    const parsed = { category, gender, type } as CategoryInput;
    if (categories.some((existing) => isSameCategory(existing, parsed))) {
      throw new TournamentInputError('Категория указана дважды');
    }
    categories.push(parsed);
  }
  return categories;
}

function formatCategory({ category, gender, type }: CategoryInput): string {
  const label = (list: ReadonlyArray<{ id: string; ru: string }>, id: string) =>
    list.find((item) => item.id === id)?.ru ?? id;
  return `${label(CATEGORIES, category)} ${label(GENDERS, gender)} - ${label(BOW_TYPES, type)}`;
}

// Категории, которые нельзя удалить: в них есть активные заявки или результаты
async function findBlockedCategories(tx: Prisma.TransactionClient, categoryIds: number[]) {
  if (categoryIds.length === 0) return [];
  return tx.tournamentCategory.findMany({
    where: {
      id: { in: categoryIds },
      OR: [
        { registrations: { some: { status: { in: ACTIVE_REGISTRATION_STATUSES } } } },
        { results: { some: {} } },
      ],
    },
    select: { category: true, gender: true, type: true },
  });
}

// Удаляет категории вместе с отклонёнными и отозванными заявками.
// Если есть активные заявки или результаты — ничего не удаляет.
export async function deleteCategories(tx: Prisma.TransactionClient, categoryIds: number[]): Promise<void> {
  if (categoryIds.length === 0) return;

  const blocked = await findBlockedCategories(tx, categoryIds);
  if (blocked.length > 0) {
    throw new TournamentConflictError(
      `Есть заявки на проверке, одобренные заявки или результаты: ${blocked.map(formatCategory).join(', ')}`
    );
  }

  await tx.registration.deleteMany({
    where: { tournamentCategoryId: { in: categoryIds }, status: { in: INACTIVE_REGISTRATION_STATUSES } },
  });
  await tx.tournamentCategory.deleteMany({ where: { id: { in: categoryIds } } });
}
