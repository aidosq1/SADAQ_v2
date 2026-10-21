"use client";

import { useEffect, useState } from "react";
import { Card, cardInteractive, cardSurface } from "@/components/ui/card";
import { Users, Trophy, MapPin, Globe, Medal, Activity, FileText, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section";
import { IconTile } from "@/components/ui/icon-tile";
import { Stat } from "@/components/ui/stat";
import { LoadingState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface SiteStat {
    id: number;
    key: string;
    value: string;
    label: string;
    labelKk?: string;
    labelEn?: string;
    iconType: string;
    sortOrder: number;
    isActive: boolean;
}

interface Partner {
    id: number;
    name: string;
    logo?: string;
    websiteUrl?: string;
    isActive: boolean;
}

interface SiteContent {
    id: number;
    key: string;
    section: string;
    value: string;
    valueKk?: string;
    valueEn?: string;
}

const iconMap: Record<string, LucideIcon> = {
    mapPin: MapPin,
    users: Users,
    badge: Medal,
    trophy: Trophy,
};

export default function Page() {
    const t = useTranslations("AboutPage");
    const tFooter = useTranslations("Footer");
    const locale = useLocale();

    const [stats, setStats] = useState<SiteStat[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [content, setContent] = useState<Record<string, SiteContent>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, partnersRes, contentRes] = await Promise.all([
                    fetch('/api/stats?isActive=true'),
                    fetch('/api/partners?isActive=true'),
                    fetch('/api/content?section=about')
                ]);

                const statsData = await statsRes.json();
                const partnersData = await partnersRes.json();
                const contentData = await contentRes.json();

                if (statsData.data) setStats(statsData.data);
                if (partnersData.data) setPartners(partnersData.data);
                if (contentData.data) {
                    const contentMap: Record<string, SiteContent> = {};
                    contentData.data.forEach((item: SiteContent) => {
                        contentMap[item.key] = item;
                    });
                    setContent(contentMap);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getLocalizedLabel = (stat: SiteStat) => {
        if (locale === 'kk' && stat.labelKk) return stat.labelKk;
        if (locale === 'en' && stat.labelEn) return stat.labelEn;
        return stat.label;
    };

    const getContent = (key: string, fallback: string | React.ReactNode) => {
        const item = content[key];
        if (!item) return fallback;
        if (locale === 'kk' && item.valueKk) return item.valueKk;
        if (locale === 'en' && item.valueEn) return item.valueEn;
        return item.value;
    };

    // Rich text components for translations with HTML-like tags
    const richTextComponents = {
        bold: (chunks: React.ReactNode) => <strong className="font-bold">{chunks}</strong>
    };

    const quickLinks: { title: string; icon: LucideIcon; href: string }[] = [
        { title: tFooter("leadership"), icon: Users, href: "/about/leadership" },
        { title: t("stat_regions"), icon: MapPin, href: "/about/regions" },
        { title: tFooter("history"), icon: Trophy, href: "/about/history" },
        { title: t("sec_statute") || "Documents", icon: FileText, href: "/documents" },
    ];

    const fallbackOrganizations: { name: string; icon: LucideIcon }[] = [
        { name: "World Archery", icon: Globe },
        { name: "Asian Archery", icon: Medal },
        { name: "NOC KZ", icon: Trophy },
    ];

    return (
        <>
            {/* Hero */}
            <section className="flex min-h-[420px] w-full items-center justify-center bg-gradient-to-b from-primary to-primary-deep pb-16 text-primary-foreground md:min-h-[560px]">
                <Container size="narrow" className="flex flex-col items-center py-10 text-center">
                    <Image
                        src="/logo_federation_circular.png"
                        alt="Logo"
                        width={256}
                        height={256}
                        priority
                        className="mb-6 size-40 object-contain drop-shadow-2xl sm:size-52 md:mb-8 md:size-64"
                    />
                    <h1 className="type-display text-gold">
                        {getContent("about_hero_title_1", t("hero_title_1"))} <br />
                        <span className="text-white">{getContent("about_hero_title_2", t("hero_title_2"))}</span>
                    </h1>
                </Container>
            </section>

            {/* Quick links */}
            <Container className="relative z-10 -mt-12 md:-mt-16">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                cardSurface,
                                cardInteractive,
                                "group flex h-full flex-col items-center gap-3 p-4 text-center shadow-md sm:flex-row sm:p-6 sm:text-left"
                            )}
                        >
                            <IconTile icon={item.icon} />
                            <span className="type-h4 text-foreground transition-colors group-hover:text-primary">
                                {item.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </Container>

            <Container className="space-y-16 py-12 md:space-y-24 md:py-16">
                {/* Mission */}
                <section className="max-w-3xl space-y-4">
                    <p className="type-eyebrow text-gold-strong">
                        {getContent("mission_badge", t("mission_badge"))}
                    </p>
                    <h2 className="type-h2 text-primary">
                        {getContent("mission_title", t("mission_title"))}
                    </h2>
                    <p className="type-body text-muted-foreground md:text-lg">
                        {getContent("mission_desc", t("mission_desc"))}
                    </p>
                </section>

                {/* Statistics */}
                <section>
                    <SectionHeader title={t("stats_title")} align="center" />

                    {loading ? (
                        <LoadingState className="min-h-[160px]" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                            {stats.map((stat) => (
                                <Card key={stat.id} className="px-4">
                                    <Stat
                                        icon={iconMap[stat.iconType] ?? Activity}
                                        value={stat.value}
                                        label={getLocalizedLabel(stat)}
                                    />
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* International Recognition */}
                <section className="rounded-xl bg-secondary px-6 py-10 md:p-12">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <IconTile icon={Globe} size="lg" className="bg-background" />
                        <h2 className="type-h2 text-primary">{getContent("recognition_title", t("recognition_title"))}</h2>
                        <p className="type-body text-muted-foreground md:text-lg">
                            {getContent("recognition_desc", t.rich("recognition_desc", richTextComponents))}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 pt-4">
                            {partners.length > 0
                                ? partners.map((partner) => (
                                    <div key={partner.id} className="flex items-center gap-2 font-heading font-semibold text-foreground">
                                        {partner.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={partner.logo} alt={partner.name} className="h-8 w-auto object-contain" />
                                        ) : (
                                            <Globe className="size-6 text-primary" />
                                        )}
                                        <span className="hidden sm:inline">{partner.name}</span>
                                    </div>
                                ))
                                : fallbackOrganizations.map(({ name, icon: Icon }) => (
                                    <div key={name} className="flex items-center gap-2 font-heading font-semibold text-foreground">
                                        <Icon className="size-6 text-primary" />
                                        <span className="hidden sm:inline">{name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>
            </Container>
        </>
    );
}
