"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AthleteFilters, type AthleteFilterKey } from "@/components/filters/AthleteFilters";
import { startNavigationProgress } from "@/components/layout/NavigationProgress";

interface Props {
  currentCategory: string;
  currentGender: string;
  currentType: string;
  locale: string;
}

export default function TeamFilters({ currentCategory, currentGender, currentType, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: AthleteFilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startNavigationProgress();
    router.push(`?${params.toString()}`);
  }

  return (
    <AthleteFilters
      category={currentCategory}
      gender={currentGender}
      type={currentType}
      locale={locale}
      onChange={updateFilter}
    />
  );
}
