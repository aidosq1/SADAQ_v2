"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import KazakhstanMap from "@/components/KazakhstanMap";
import { useTranslations } from "next-intl";

export default function RegionsPage() {
    const t = useTranslations("RegionsPage");

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{t("title")}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            {/* Interactive Map */}
            <div className="w-full h-auto min-h-[600px] bg-muted/5 rounded-3xl overflow-hidden shadow-sm relative">
                <KazakhstanMap />
            </div>

            {/* Branches List Example */}
            <section>
                <h2 className="text-2xl font-bold mb-6">{t("contact_info_title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            city: t("city_astana"),
                            director: t("director_astana"),
                            address: t("address_astana"),
                            phone: "+7 (7172) 55-55-55"
                        },
                        {
                            city: t("city_almaty"),
                            director: t("director_almaty"),
                            address: t("address_almaty"),
                            phone: "+7 (727) 333-22-11"
                        },
                        {
                            city: t("city_shymkent"),
                            director: t("director_shymkent"),
                            address: t("address_shymkent"),
                            phone: "+7 (7252) 44-00-99"
                        },
                    ].map((branch, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {branch.city}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">{t("director")}</div>
                                        <div className="font-medium">{branch.director}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">{t("address")}</div>
                                        <div className="text-sm">{branch.address}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">{t("phone")}</div>
                                        <div className="text-sm font-medium">{branch.phone}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
