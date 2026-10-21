"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "@/components/ui/section";

interface Partner {
  id: number;
  name: string;
  logo?: string | null;
  websiteUrl?: string | null;
  isGeneral?: boolean;
}

const LOGO_SIZES = {
  general: {
    image: "h-auto w-64 sm:w-80 md:w-[420px]",
    placeholder: "size-56 md:size-80",
    width: 560,
    height: 320,
    caption: "type-small max-w-xs",
  },
  regular: {
    image: "size-16 md:size-20",
    placeholder: "size-16 md:size-20",
    width: 80,
    height: 80,
    caption: "type-caption max-w-[120px]",
  },
} as const;

function PartnerLogo({ partner, variant }: { partner: Partner; variant: keyof typeof LOGO_SIZES }) {
  const size = LOGO_SIZES[variant];
  const content = (
    <>
      {partner.logo ? (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={size.width}
          height={size.height}
          className={cn("object-contain", size.image)}
        />
      ) : (
        <div className={cn("flex items-center justify-center rounded-full bg-secondary", size.placeholder)}>
          <span className="type-small font-medium text-muted-foreground">{partner.name.slice(0, 2)}</span>
        </div>
      )}
      <span className={cn("text-center leading-tight text-muted-foreground", size.caption)}>
        {partner.name}
      </span>
    </>
  );

  const className = "flex flex-col items-center gap-3";

  return partner.websiteUrl ? (
    <a
      href={partner.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, "transition-opacity hover:opacity-80")}
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
      <Section className="border-t">
        <div className="flex justify-center gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="size-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </Section>
    );
  }

  if (error || partners.length === 0) {
    return null;
  }

  return (
    <Section className="border-t">
      {generalPartners.length > 0 && (
        <div className={cn(regularPartners.length > 0 && "mb-12 border-b pb-12")}>
          <SectionHeader title={t("general_title")} align="center" />
          <div className="flex flex-wrap items-center justify-center gap-12">
            {generalPartners.map((partner) => (
              <PartnerLogo key={partner.id} partner={partner} variant="general" />
            ))}
          </div>
        </div>
      )}

      {regularPartners.length > 0 && (
        <>
          <SectionHeader title={t("title")} align="center" />
          <div className="flex flex-wrap items-start justify-center gap-8 md:gap-12">
            {regularPartners.map((partner) => (
              <PartnerLogo key={partner.id} partner={partner} variant="regular" />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
