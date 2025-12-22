"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

interface Partner {
  id: number;
  name: string;
  logo?: string | null;
  websiteUrl?: string | null;
}

export function PartnersBlock() {
  const locale = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/partners?isActive=true');
        const data = await res.json();
        if (data.success && data.data) {
          setPartners(data.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  const sectionTitle = locale === 'kk' ? 'Серіктестер' : locale === 'en' ? 'Partners & Affiliations' : 'Партнёры и аффилиации';

  if (loading) {
    return (
      <section className="py-12 bg-white border-t border-[hsl(var(--border-light))]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-[hsl(var(--light-gray))] rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white border-t border-[hsl(var(--border-light))]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-[hsl(var(--official-navy))] gold-accent mx-auto w-fit">
            {sectionTitle}
          </h2>
        </div>

        {/* Partners Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <div key={partner.id}>
              {partner.websiteUrl ? (
                <Link
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={80}
                      className="object-contain w-16 h-16 md:w-20 md:h-20"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--light-gray))] flex items-center justify-center">
                      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {partner.name.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-center text-[hsl(var(--muted-foreground))] max-w-[100px] leading-tight">
                    {partner.name}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={80}
                      className="object-contain w-16 h-16 md:w-20 md:h-20"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--light-gray))] flex items-center justify-center">
                      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {partner.name.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-center text-[hsl(var(--muted-foreground))] max-w-[100px] leading-tight">
                    {partner.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
