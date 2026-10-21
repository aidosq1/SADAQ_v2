"use client";

import { useEffect, useState } from "react";
import { cardInteractive, cardSurface } from "@/components/ui/card";
import { Users, Trophy, MapPin, Globe, Medal, Activity, FileText, ArrowRight, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconTile } from "@/components/ui/icon-tile";
import { Stat } from "@/components/ui/stat";
import { LoadingState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export interface SiteStat {
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

export interface Partner {
    id: number;
    name: string;
    logo?: string;
    websiteUrl?: string;
    isActive: boolean;
}

export interface SiteContent {
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

// Тексты раздела по ключу: { mission_title: {...}, ... }
function toContentMap(items: SiteContent[]): Record<string, SiteContent> {
    return Object.fromEntries(items.map((item) => [item.key, item]));
}

export interface AboutInitialData {
    stats: SiteStat[];
    partners: Partner[];
    content: SiteContent[];
}

interface AboutViewProps {
    initialData?: AboutInitialData;
}

export default function AboutView({ initialData }: AboutViewProps) {
    const t = useTranslations("AboutPage");
    const tFooter = useTranslations("Footer");
    const locale = useLocale();

    const [stats, setStats] = useState<SiteStat[]>(initialData?.stats ?? []);
    const [partners, setPartners] = useState<Partner[]>(initialData?.partners ?? []);
    const [content, setContent] = useState<Record<string, SiteContent>>(() => toContentMap(initialData?.content ?? []));
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        // Данные пришли с сервера вместе с HTML
        if (initialData) return;
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
                if (contentData.data) setContent(toContentMap(contentData.data));
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [initialData]);

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
            {/* Hero: название федерации слева, герб справа */}
            <section className="surface-inverse overflow-hidden">
                <Container className="grid items-center gap-10 pt-14 pb-28 md:pt-20 md:pb-36 lg:grid-cols-12">
                    <h1 className="type-display text-white lg:col-span-8">
                        <span className="text-gold">{getContent("about_hero_title_1", t("hero_title_1"))}</span>{" "}
                        {getContent("about_hero_title_2", t("hero_title_2"))}
                    </h1>
                    <div className="relative hidden justify-self-center lg:col-span-4 lg:block">
                        <div aria-hidden="true" className="absolute inset-0 rounded-full bg-gold/20 blur-3xl" />
                        <Image
                            src="/logo_federation_circular.png"
                            alt=""
                            width={320}
                            height={320}
                            priority
                            className="relative size-72 object-contain drop-shadow-2xl xl:size-80"
                        />
                    </div>
                </Container>
            </section>

            {/* Быстрые ссылки на разделы, заходят на нижний край hero */}
            <Container className="relative z-10 -mt-16 md:-mt-20">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(cardSurface, cardInteractive, "group flex items-center gap-4 p-5 shadow-raised")}
                        >
                            <IconTile icon={item.icon} />
                            <span className="type-h4 min-w-0 flex-1 text-foreground transition-colors group-hover:text-primary">
                                {item.title}
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                    ))}
                </div>
            </Container>

            {/* Mission */}
            <Section>
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-5">
                        <Eyebrow className="mb-3">{getContent("mission_badge", t("mission_badge"))}</Eyebrow>
                        <h2 className="type-h2 text-foreground">{getContent("mission_title", t("mission_title"))}</h2>
                    </div>
                    <p className="type-lead text-muted-foreground lg:col-span-7 lg:pt-8">
                        {getContent("mission_desc", t("mission_desc"))}
                    </p>
                </div>
            </Section>

            {/* Statistics */}
            <Section tone="inverse">
                <SectionHeader title={t("stats_title")} tone="inverse" />
                {loading ? (
                    <LoadingState className="min-h-[120px] [&_svg]:text-gold" />
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
                        {stats.map((stat) => (
                            <Stat
                                key={stat.id}
                                tone="inverse"
                                icon={iconMap[stat.iconType] ?? Activity}
                                value={stat.value}
                                label={getLocalizedLabel(stat)}
                                className="border-white/10 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0"
                            />
                        ))}
                    </div>
                )}
            </Section>

            {/* International Recognition */}
            <Section tone="muted">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-5">
                        <IconTile icon={Globe} size="lg" className="mb-6 bg-background" />
                        <h2 className="type-h2 text-foreground">{getContent("recognition_title", t("recognition_title"))}</h2>
                        <p className="type-body mt-4 text-muted-foreground">
                            {getContent("recognition_desc", t.rich("recognition_desc", richTextComponents))}
                        </p>
                    </div>

                    <div className="grid auto-rows-[96px] grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
                        {partners.length > 0
                            ? partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    title={partner.name}
                                    className="flex items-center justify-center rounded-lg border bg-background px-4 shadow-card"
                                >
                                    {partner.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={partner.logo} alt={partner.name} className="max-h-12 w-auto object-contain" />
                                    ) : (
                                        <span className="type-small text-center font-semibold text-muted-foreground">{partner.name}</span>
                                    )}
                                </div>
                            ))
                            : fallbackOrganizations.map(({ name, icon: Icon }) => (
                                <div
                                    key={name}
                                    className="flex items-center justify-center gap-2 rounded-lg border bg-background px-4 font-heading font-semibold shadow-card"
                                >
                                    <Icon className="size-5 text-primary" />
                                    {name}
                                </div>
                            ))}
                    </div>
                </div>
            </Section>
        </>
    );
}
