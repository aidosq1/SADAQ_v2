"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User, Mail, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{t("title")}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            {/* Branches List */}
            <section>
                <h2 className="text-2xl font-bold mb-6">{t("contact_info_title")}</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : regions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {t("no_branches") || "Филиалы не найдены"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {regions.map((region) => (
                            <Card key={region.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        {getLocalizedName(region)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-muted-foreground">{t("director")}</div>
                                            <div className="font-medium">{getLocalizedDirector(region)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-muted-foreground">{t("address")}</div>
                                            <div className="text-sm">{getLocalizedAddress(region)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-muted-foreground">{t("phone")}</div>
                                            <div className="text-sm font-medium">{region.phone}</div>
                                        </div>
                                    </div>
                                    {region.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t("email") || "Email"}</div>
                                                <div className="text-sm font-medium">{region.email}</div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
