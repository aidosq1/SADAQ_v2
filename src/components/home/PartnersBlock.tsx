"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Globe, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";

interface Partner {
  id: number;
  name: string;
  logo?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function PartnersBlock() {
  const t = useTranslations("PartnersBlock");
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
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="bg-background py-16 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center text-muted-foreground opacity-50">{t("title")}</h2>
          <div className="flex justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-center text-muted-foreground opacity-50">{t("title")}</h2>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {partners.map((partner) => (
            <div key={partner.id} className="flex flex-col items-center p-8 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
              <div className="text-3xl font-black text-foreground mb-6 tracking-tight">
                {partner.name}
              </div>

              <div className="flex flex-col gap-3 w-full">
                {partner.websiteUrl && (
                  <Link
                    href={partner.websiteUrl}
                    target="_blank"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">{getHostname(partner.websiteUrl)}</span>
                  </Link>
                )}

                <div className="flex gap-2 justify-center w-full pt-2 border-t border-border/50">
                  {partner.instagramUrl && (
                    <Link
                      href={partner.instagramUrl}
                      target="_blank"
                      className="p-2 text-muted-foreground hover:text-[#E1306C] transition-colors hover:bg-muted rounded-md"
                      title="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </Link>
                  )}
                  {partner.facebookUrl && (
                    <Link
                      href={partner.facebookUrl}
                      target="_blank"
                      className="p-2 text-muted-foreground hover:text-[#1877F2] transition-colors hover:bg-muted rounded-md"
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
