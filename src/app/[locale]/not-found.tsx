import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const LABELS = {
  ru: { title: "Страница не найдена", home: "На главную" },
  kk: { title: "Бет табылмады", home: "Басты бетке" },
  en: { title: "Page not found", home: "Back to home" },
} as const;

// 404 внутри сайта: с шапкой и футером, крупный код и одна кнопка
export default async function NotFound() {
  const locale = await getLocale();
  const labels = LABELS[locale as keyof typeof LABELS] ?? LABELS.ru;

  return (
    <section className="surface-inverse">
      <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-20">
        <p className="type-number text-[7rem] leading-none text-gold md:text-[10rem]">404</p>
        <h1 className="type-h1 text-white">{labels.title}</h1>
        <Button variant="inverse" size="lg" asChild>
          <Link href="/">
            <ArrowLeft />
            {labels.home}
          </Link>
        </Button>
      </Container>
    </section>
  );
}
