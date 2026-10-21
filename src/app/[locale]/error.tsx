"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { PageContainer } from "@/components/ui/container";
import { useLocale } from "next-intl";

const LABELS = {
  ru: { title: "Произошла ошибка", retry: "Попробовать снова" },
  kk: { title: "Қате орын алды", retry: "Қайталау" },
  en: { title: "Something went wrong", retry: "Try again" },
} as const;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const labels = LABELS[locale as keyof typeof LABELS] ?? LABELS.ru;

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <PageContainer>
      <EmptyState
        icon={AlertTriangle}
        title={labels.title}
        className="min-h-[50vh] border-none"
        action={<Button onClick={reset}>{labels.retry}</Button>}
      />
    </PageContainer>
  );
}
