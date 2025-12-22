"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Phone, MapPin } from "lucide-react";

interface SiteContent {
    id: number;
    key: string;
    section: string;
    value: string;
    valueKk?: string;
    valueEn?: string;
}

export function Footer() {
    const t = useTranslations("Footer");
    const locale = useLocale();
    const [content, setContent] = useState<Record<string, SiteContent>>({});

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/api/content?section=footer');
                const data = await res.json();
                if (data.data) {
                    const contentMap: Record<string, SiteContent> = {};
                    data.data.forEach((item: SiteContent) => {
                        contentMap[item.key] = item;
                    });
                    setContent(contentMap);
                }
            } catch {
                // silently fail
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

    return (
        <footer className="bg-[hsl(var(--official-navy))] text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {/* About Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--official-gold))]">
                            {t("about")}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about/leadership" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("leadership")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about/history" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("history")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about/regions" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("vacancies")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Athletes Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--official-gold))]">
                            {t("athletes")}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/calendar" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("comp_calendar")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/results" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("protocols")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/ranking" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("ratings")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/documents" className="text-white/70 hover:text-white text-sm transition-colors">
                                    {t("antidoping")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacts Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--official-gold))]">
                            {t("contacts")}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2 text-white/70">
                                <MapPin className="w-4 h-4 mt-0.5 text-[hsl(var(--official-gold))] shrink-0" />
                                <span>{getContent("footer_address", "address")}</span>
                            </li>
                            <li className="flex items-center gap-2 text-white/70">
                                <Phone className="w-4 h-4 text-[hsl(var(--official-gold))] shrink-0" />
                                <span>{getContent("footer_phone", "phone")}</span>
                            </li>
                            <li className="flex items-center gap-2 text-white/70">
                                <Mail className="w-4 h-4 text-[hsl(var(--official-gold))] shrink-0" />
                                <span>{getContent("footer_email", "email")}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--official-gold))]">
                            {t("socials")}
                        </h3>
                        <div className="flex gap-3">
                            <a
                                href="https://www.instagram.com/kazarchery_official"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded bg-white/10 hover:bg-[hsl(var(--official-gold))] flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.youtube.com/@kazarchery"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded bg-white/10 hover:bg-[hsl(var(--official-gold))] flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-white/50">
                        © {new Date().getFullYear()} {t("rights")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
