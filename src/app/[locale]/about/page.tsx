"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, MapPin, Globe, Medal, Activity, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

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

const iconMap: Record<string, React.ReactNode> = {
    mapPin: <MapPin className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
    badge: <BadgeIcon className="w-6 h-6" />,
    trophy: <Trophy className="w-6 h-6" />,
    default: <Activity className="w-6 h-6" />,
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

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[500px] w-full flex items-center justify-center bg-gradient-to-b from-[#7B1B1B] to-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10" />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                    <div className="mb-8 animate-fade-in-up">
                        <Image src="/logo_federation_circular.png" alt="Logo" width={160} height={160} className="w-36 h-36 object-contain drop-shadow-2xl" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#D4AF37] drop-shadow-lg">
                        {getContent("about_hero_title_1", t("hero_title_1"))} <br />
                        <span className="text-white">{getContent("about_hero_title_2", t("hero_title_2"))}</span>
                    </h1>
                </div>
            </section>

            {/* Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { title: tFooter("leadership"), icon: <Users className="w-6 h-6" />, href: "/about/leadership" },
                        { title: t("stat_regions"), icon: <MapPin className="w-6 h-6" />, href: "/about/regions" },
                        { title: tFooter("history"), icon: <Trophy className="w-6 h-6" />, href: "/about/history" },
                        { title: t("sec_statute") || "Documents", icon: <Activity className="w-6 h-6" />, href: "/documents" },
                    ].map((item, index) => (
                        <Link key={index} href={item.href} className="block group">
                            <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white text-foreground">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="bg-primary/5 text-primary p-4 rounded-full group-hover:bg-[#B54B35]/10 group-hover:text-[#B54B35] transition-colors duration-300">
                                        {item.icon}
                                    </div>
                                    <div className="font-bold text-lg group-hover:text-[#B54B35] transition-colors">{item.title}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
                {/* Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full font-medium text-sm">
                            {getContent("mission_badge", t("mission_badge"))}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            {getContent("mission_title", t("mission_title"))}
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {getContent("mission_desc", t("mission_desc"))}
                        </p>
                    </div>
                    <div className="bg-muted rounded-2xl h-[400px] relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/50">
                            <Activity className="w-16 h-16 opacity-20" />
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-12">{t("stats_title")}</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat) => (
                                <Card key={stat.id} className="border-none shadow-lg bg-card text-card-foreground">
                                    <CardContent className="pt-6 text-center space-y-4">
                                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
                                            {iconMap[stat.iconType] || iconMap.default}
                                        </div>
                                        <div className="text-4xl font-bold text-primary">{stat.value}</div>
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            {getLocalizedLabel(stat)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* International Recognition */}
                <section className="bg-secondary/30 rounded-3xl p-8 md:p-12">
                    <div className="text-center max-w-3xl mx-auto space-y-8">
                        <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl font-bold">{getContent("recognition_title", t("recognition_title"))}</h2>
                        <p className="text-lg text-muted-foreground">
                            {getContent("recognition_desc", t.rich("recognition_desc", richTextComponents))}
                        </p>

                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            {partners.length > 0 ? (
                                partners.map((partner) => (
                                    <div key={partner.id} className="font-bold text-xl flex items-center gap-2">
                                        {partner.logo ? (
                                            <img src={partner.logo} alt={partner.name} className="h-8 w-auto object-contain" />
                                        ) : (
                                            <Globe className="w-6 h-6" />
                                        )}
                                        {partner.name}
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="font-bold text-xl flex items-center gap-2"><Globe className="w-6 h-6" /> World Archery</div>
                                    <div className="font-bold text-xl flex items-center gap-2"><Medal className="w-6 h-6" /> Asian Archery</div>
                                    <div className="font-bold text-xl flex items-center gap-2"><Trophy className="w-6 h-6" /> NOC KZ</div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function BadgeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
        </svg>
    )
}
