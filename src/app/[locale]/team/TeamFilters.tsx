"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

interface Props {
  currentCategory: string;
  currentGender: string;
  currentType: string;
  locale: string;
}

export default function TeamFilters({ currentCategory, currentGender, currentType, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={currentCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("category", cat.id)}
          >
            {getLocalizedLabel(cat, locale)}
          </Button>
        ))}
      </div>

      {/* Gender Filter */}
      <div className="flex gap-1">
        {GENDERS.map((g) => (
          <Button
            key={g.id}
            variant={currentGender === g.id ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("gender", g.id)}
          >
            {getLocalizedLabel(g, locale)}
          </Button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex gap-1">
        {BOW_TYPES.map((t) => (
          <Button
            key={t.id}
            variant={currentType === t.id ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("type", t.id)}
          >
            {getLocalizedLabel(t, locale)}
          </Button>
        ))}
      </div>
    </div>
  );
}
