"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-6">{labels.title}</h2>
      <Button onClick={reset}>{labels.retry}</Button>
    </div>
  );
}
