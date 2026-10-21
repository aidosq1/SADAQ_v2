"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User, Mail, type LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/states";

function ContactRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
                <div className="type-caption">{label}</div>
                <div className="type-small font-medium break-words">{children}</div>
            </div>
        </div>
    );
}

interface Region {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    director: string;
    directorKk?: string;
    directorEn?: string;
    directorTitle?: string;
    directorTitleKk?: string;
    directorTitleEn?: string;
    address: string;
    addressKk?: string;
    addressEn?: string;
    phone: string;
    email?: string;
    isActive: boolean;
}

export default function RegionsPage() {
    const t = useTranslations("RegionsPage");
    const locale = useLocale();
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRegions() {
            try {
                const res = await fetch('/api/regions?limit=50');
                const data = await res.json();
                if (data.data) {
                    setRegions(data.data);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        }
        fetchRegions();
    }, []);

    const getLocalizedName = (region: Region) => {
        if (locale === 'kk' && region.nameKk) return region.nameKk;
        if (locale === 'en' && region.nameEn) return region.nameEn;
        return region.name;
    };

    const getLocalizedDirector = (region: Region) => {
        if (locale === 'kk' && region.directorKk) return region.directorKk;
        if (locale === 'en' && region.directorEn) return region.directorEn;
        return region.director;
    };

    const getLocalizedAddress = (region: Region) => {
        if (locale === 'kk' && region.addressKk) return region.addressKk;
        if (locale === 'en' && region.addressEn) return region.addressEn;
        return region.address;
    };


    return (
        <PageContainer>
            <PageHeader title={t("title")} />

            {loading ? (
                <LoadingState />
            ) : regions.length === 0 ? (
                <EmptyState icon={MapPin} title={t("no_branches") || "Филиалы не найдены"} />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regions.map((region) => (
                        <Card key={region.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <MapPin className="size-5 shrink-0" />
                                    {getLocalizedName(region)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ContactRow icon={User} label={t("director")}>
                                    {getLocalizedDirector(region)}
                                </ContactRow>
                                <ContactRow icon={MapPin} label={t("address")}>
                                    {getLocalizedAddress(region)}
                                </ContactRow>
                                <ContactRow icon={Phone} label={t("phone")}>
                                    <a href={`tel:${region.phone.replace(/[^\d+]/g, "")}`} className="hover:text-primary hover:underline">
                                        {region.phone}
                                    </a>
                                </ContactRow>
                                {region.email && (
                                    <ContactRow icon={Mail} label={t("email") || "Email"}>
                                        <a href={`mailto:${region.email}`} className="hover:text-primary hover:underline">
                                            {region.email}
                                        </a>
                                    </ContactRow>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
