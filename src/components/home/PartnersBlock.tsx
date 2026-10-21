"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";

interface Partner {
  id: number;
  name: string;
  logo?: string | null;
  websiteUrl?: string | null;
  isGeneral?: boolean;
}

const LOGO_TILE = {
  general: {
    tile: "col-span-2 row-span-2 flex-col gap-4 px-8 py-6",
    image: "max-h-28 md:max-h-32 w-auto",
    width: 480,
    height: 200,
  },
  regular: {
    tile: "px-5",
    image: "max-h-16 w-auto grayscale opacity-80 transition-[filter,opacity] duration-300 group-hover:grayscale-0 group-hover:opacity-100",
    width: 160,
    height: 80,
  },
} as const;

// Логотип партнёра на белой плитке; без логотипа — название текстом
function PartnerLogo({ partner, variant, label }: {
  partner: Partner;
  variant: keyof typeof LOGO_TILE;
  label?: string;
}) {
  const size = LOGO_TILE[variant];
  const className = cn(
    "group flex items-center justify-center rounded-lg border bg-background shadow-card",
    size.tile
  );
  const logo = partner.logo ? (
    <Image
      src={partner.logo}
      alt={partner.name}
      title={partner.name}
      width={size.width}
      height={size.height}
      className={cn("object-contain", size.image)}
    />
  ) : (
    <span className="type-small text-center font-semibold text-muted-foreground">{partner.name}</span>
  );
  const content = label ? (
    <>
      <Eyebrow className="self-start">{label}</Eyebrow>
      <div className="flex flex-1 items-center">{logo}</div>
    </>
  ) : (
    logo
  );

  return partner.websiteUrl ? (
    <a
      href={partner.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, "transition-[border-color,box-shadow] hover:border-foreground/15 hover:shadow-raised")}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function PartnersBlock() {
  const t = useTranslations("PartnersBlock");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/partners?isActive=true');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPartners(data.data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);


  const generalPartners = partners.filter((p) => p.isGeneral);
  const regularPartners = partners.filter((p) => !p.isGeneral);

  if (loading) {
    return (
      <Section tone="muted">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-background" />
          ))}
        </div>
      </Section>
    );
  }

  if (error || partners.length === 0) {
    return null;
  }

  // Генеральный партнёр — большая плитка 2×2 в общей сетке логотипов
  return (
    <Section tone="muted">
      <SectionHeader title={t("title")} />
      <div className="grid auto-rows-[112px] grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
        {generalPartners.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} variant="general" label={t("general_title")} />
        ))}
        {regularPartners.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} variant="regular" />
        ))}
      </div>
    </Section>
  );
}
