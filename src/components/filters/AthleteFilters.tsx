"use client";

import { Chip, ChipGroup } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

export type AthleteFilterKey = "category" | "gender" | "type";

interface LabeledOption {
  id: string;
  ru: string;
  kk: string;
  en: string;
}

interface AthleteFiltersProps {
  category: string;
  gender: string;
  type: string;
  locale: string;
  onChange: (key: AthleteFilterKey, value: string) => void;
}

// Фильтры рейтинга и сборной: возраст — чипами, пол и тип лука — переключателями
export function AthleteFilters({ category, gender, type, locale, onChange }: AthleteFiltersProps) {
  const toOptions = (items: ReadonlyArray<LabeledOption>) =>
    items.map((item) => ({ value: item.id, label: getLocalizedLabel(item, locale) }));
  // Подпись группы для скринридера — сами варианты через «/»
  const groupLabel = (items: ReadonlyArray<LabeledOption>) =>
    items.map((item) => getLocalizedLabel(item, locale)).join(" / ");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <ChipGroup className="-mx-4 flex-nowrap overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((option) => (
          <Chip
            key={option.id}
            active={category === option.id}
            onClick={() => onChange("category", option.id)}
          >
            {getLocalizedLabel(option, locale)}
          </Chip>
        ))}
      </ChipGroup>
      <div className="flex flex-wrap gap-2">
        <Segmented
          label={groupLabel(GENDERS)}
          value={gender}
          onChange={(value) => onChange("gender", value)}
          options={toOptions(GENDERS)}
        />
        <Segmented
          label={groupLabel(BOW_TYPES)}
          value={type}
          onChange={(value) => onChange("type", value)}
          options={toOptions(BOW_TYPES)}
        />
      </div>
    </div>
  );
}
