"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react";

import { Link } from "@/navigation";
import { Container } from "@/components/ui/container";
import { SOCIAL_LINKS } from "./nav";

interface SiteContent {
    id: number;
    key: string;
    section: string;
    value: string;
    valueKk?: string;
    valueEn?: string;
}

interface FooterLink {
    href: string;
    label: string;
}

const LINK_CLASS = "text-sm text-white/70 transition-colors hover:text-white";

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        <div>
            <h3 className="type-eyebrow mb-4 text-gold">{title}</h3>
            <ul className="space-y-2.5">
                {links.map((link) => (
                    <li key={link.href + link.label}>
                        <Link href={link.href} className={LINK_CLASS}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ContactRow({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3 text-sm text-white/70">
            <Icon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            {children}
        </li>
    );
}

function InstagramIcon() {
    return (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    );
}

function YoutubeIcon() {
    return (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

const SOCIAL_CLASS =
    "flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:bg-gold hover:text-primary-deep";

export function Footer() {
    const t = useTranslations("Footer");
    const tHeader = useTranslations("Header");
    const locale = useLocale();
    const [content, setContent] = useState<Record<string, SiteContent>>({});

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/api/content?section=footer');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.data) {
                    const contentMap: Record<string, SiteContent> = {};
                    data.data.forEach((item: SiteContent) => {
                        contentMap[item.key] = item;
                    });
                    setContent(contentMap);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        }
        fetchContent();
    }, []);

    const getContent = (key: string, fallbackKey: string) => {
        const item = content[key];
        if (!item) return t(fallbackKey);
        if (locale === 'kk' && item.valueKk) return item.valueKk;
        if (locale === 'en' && item.valueEn) return item.valueEn;
        return item.value;
    };

    const phone = getContent("footer_phone", "phone");
    const email = getContent("footer_email", "email");

    const aboutLinks: FooterLink[] = [
        { href: "/about/leadership", label: t("leadership") },
        { href: "/about/history", label: t("history") },
        { href: "/about/regions", label: tHeader("regions") },
    ];

    const athleteLinks: FooterLink[] = [
        { href: "/calendar", label: t("comp_calendar") },
        { href: "/results", label: t("protocols") },
        { href: "/ranking", label: t("ratings") },
        { href: "/documents", label: t("antidoping") },
    ];

    return (
        <footer className="surface-inverse">
            <Container className="pt-14 pb-8 md:pt-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="sm:col-span-2 lg:col-span-4">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo_federation_circular.png"
                                alt="SADAQ"
                                width={56}
                                height={56}
                                className="size-14 shrink-0 object-contain"
                            />
                            <span className="flex flex-col">
                                <span className="font-heading text-base leading-tight font-bold text-white">
                                    {tHeader("logo_name")}
                                </span>
                                <span className="mt-0.5 text-xs text-white/60">{tHeader("logo_country")}</span>
                            </span>
                        </Link>
                        <div className="mt-6 flex gap-2">
                            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={SOCIAL_CLASS}>
                                <InstagramIcon />
                            </a>
                            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={SOCIAL_CLASS}>
                                <YoutubeIcon />
                            </a>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <FooterColumn title={t("about")} links={aboutLinks} />
                    </div>
                    <div className="lg:col-span-3">
                        <FooterColumn title={t("athletes")} links={athleteLinks} />
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="type-eyebrow mb-4 text-gold">{t("contacts")}</h3>
                        <ul className="space-y-3">
                            <ContactRow icon={MapPin}>
                                <span>{getContent("footer_address", "address")}</span>
                            </ContactRow>
                            <ContactRow icon={Phone}>
                                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="transition-colors hover:text-white">
                                    {phone}
                                </a>
                            </ContactRow>
                            <ContactRow icon={Mail}>
                                <a href={`mailto:${email}`} className="break-all transition-colors hover:text-white">
                                    {email}
                                </a>
                            </ContactRow>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-xs text-white/50">
                        © {new Date().getFullYear()} {t("rights")}
                    </p>
                </div>
            </Container>
        </footer>
    );
}
