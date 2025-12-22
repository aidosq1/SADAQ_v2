export const KAZAKHSTAN_REGIONS = [
    { id: "astana", name: "г. Астана" },
    { id: "almaty", name: "г. Алматы" },
    { id: "shymkent", name: "г. Шымкент" },
    { id: "abai", name: "Абайская область" },
    { id: "akmola", name: "Акмолинская область" },
    { id: "aktobe", name: "Актюбинская область" },
    { id: "almaty_reg", name: "Алматинская область" },
    { id: "atyrau", name: "Атырауская область" },
    { id: "east_kaz", name: "Восточно-Казахстанская область" },
    { id: "jambyl", name: "Жамбылская область" },
    { id: "zhetysu", name: "Жетысуская область" },
    { id: "west_kaz", name: "Западно-Казахстанская область" },
    { id: "karaganda", name: "Карагандинская область" },
    { id: "kostanay", name: "Костанайская область" },
    { id: "kyzylorda", name: "Кызылординская область" },
    { id: "mangystau", name: "Мангистауская область" },
    { id: "pavlodar", name: "Павлодарская область" },
    { id: "north_kaz", name: "Северо-Казахстанская область" },
    { id: "turkistan", name: "Туркестанская область" },
    { id: "ulytau", name: "Улытауская область" },
] as const;

// Unified filter options with multilingual support
export const CATEGORIES = [
    { id: "Adults", ru: "Взрослые", kk: "Ересектер", en: "Adults" },
    { id: "Youth", ru: "Молодёжь", kk: "Жастар", en: "Youth" },
    { id: "Juniors", ru: "Юниоры", kk: "Юниорлар", en: "Juniors" },
    { id: "Cadets", ru: "Кадеты", kk: "Кадеттер", en: "Cadets" },
    { id: "Cubs", ru: "Юноши", kk: "Жасөспірімдер", en: "Cubs" },
] as const;

export const GENDERS = [
    { id: "M", ru: "Мужчины", kk: "Ерлер", en: "Men" },
    { id: "F", ru: "Женщины", kk: "Әйелдер", en: "Women" },
] as const;

export const BOW_TYPES = [
    { id: "Recurve", ru: "Классический", kk: "Классикалық", en: "Recurve" },
    { id: "Compound", ru: "Блочный", kk: "Блоктық", en: "Compound" },
] as const;

// Helper function to get localized label
export function getLocalizedLabel(
    item: { ru: string; kk: string; en: string },
    locale: string
): string {
    if (locale === "kk") return item.kk;
    if (locale === "en") return item.en;
    return item.ru;
}

// Type definitions
export type CategoryId = typeof CATEGORIES[number]["id"];
export type GenderId = typeof GENDERS[number]["id"];
export type BowTypeId = typeof BOW_TYPES[number]["id"];

// Default filter values
export const DEFAULT_FILTERS = {
    category: "Adults" as CategoryId,
    gender: "M" as GenderId,
    type: "Recurve" as BowTypeId,
} as const;
