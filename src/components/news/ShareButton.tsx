"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

const COPIED = {
  ru: "Ссылка скопирована",
  kk: "Сілтеме көшірілді",
  en: "Link copied",
} as const;

interface ShareButtonProps {
  title: string;
  label: string;
}

// Поделиться: системное меню на телефоне, копирование ссылки на компьютере
export function ShareButton({ title, label }: ShareButtonProps) {
  const locale = useLocale();

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(COPIED[locale as keyof typeof COPIED] ?? COPIED.ru);
    } catch (error) {
      // Пользователь закрыл системное меню — это не ошибка
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Share failed:", error);
    }
  }

  return (
    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
      <Share2 />
      {label}
    </Button>
  );
}
