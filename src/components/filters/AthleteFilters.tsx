"use client";

import { Chip, ChipGroup } from "@/components/ui/chip";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

export type AthleteFilterKey = "category" | "gender" | "type";

interface AthleteFiltersProps {
  category: string;
  gender: string;
  type: string;
  locale: string;
  onChange: (key: AthleteFilterKey, value: string) => void;
}

const GROUPS = [
  { key: "category", options: CATEGORIES },
  { key: "gender", options: GENDERS },
  { key: "type", options: BOW_TYPES },
] as const;

// Фильтры рейтинга и сборной: возраст, пол, тип лука
export function AthleteFilters({ category, gender, type, locale, onChange }: AthleteFiltersProps) {
  const current: Record<AthleteFilterKey, string> = { category, gender, type };

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {GROUPS.map((group) => (
        <ChipGroup key={group.key}>
          {group.options.map((option) => (
            <Chip
              key={option.id}
              active={current[group.key] === option.id}
              onClick={() => onChange(group.key, option.id)}
            >
              {getLocalizedLabel(option, locale)}
            </Chip>
          ))}
        </ChipGroup>
      ))}
    </div>
  );
}
