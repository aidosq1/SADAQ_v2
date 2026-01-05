"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Staff {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    role: string;
    roleTitle: string;
    roleTitleKk?: string;
    roleTitleEn?: string;
    description?: string;
    descriptionKk?: string;
    descriptionEn?: string;
    department: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
}

export default function LeadershipPage() {
    const t = useTranslations("LeadershipPage");
    const locale = useLocale();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStaff() {
            try {
                const res = await fetch('/api/staff?limit=50');
                const data = await res.json();
                if (data.data) {
                    setStaff(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch staff:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStaff();
    }, []);

    const getLocalizedName = (person: Staff) => {
        if (locale === 'kk' && person.nameKk) return person.nameKk;
        if (locale === 'en' && person.nameEn) return person.nameEn;
        return person.name;
    };

    const getLocalizedRole = (person: Staff) => {
        if (locale === 'kk' && person.roleTitleKk) return person.roleTitleKk;
        if (locale === 'en' && person.roleTitleEn) return person.roleTitleEn;
        return person.roleTitle;
    };

    const getLocalizedDescription = (person: Staff) => {
        if (locale === 'kk' && person.descriptionKk) return person.descriptionKk;
        if (locale === 'en' && person.descriptionEn) return person.descriptionEn;
        return person.description || '';
    };

    // Group staff by department
    const leadershipStaff = staff.filter(s => s.department === 'leadership');
    const committeeStaff = staff.filter(s => s.department === 'committee');
    const coachingStaff = staff.filter(s => s.department === 'coaching');

    // Find president
    const president = leadershipStaff.find(s => s.role === 'president') || leadershipStaff[0];
    const otherLeadership = leadershipStaff.filter(s => s.id !== president?.id);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
                <div className="text-center py-12 text-muted-foreground">
                    {locale === 'kk' ? 'Деректер жоқ' : locale === 'en' ? 'No data available' : 'Данные не найдены'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
            <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

            {/* President Section */}
            {president && (
                <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="shrink-0 mx-auto md:mx-0">
                            <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                                {president.image ? (
                                    <img src={president.image} alt={getLocalizedName(president)} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <User className="w-20 h-20 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-center md:text-left">
                                <h3 className="text-2xl font-bold">{getLocalizedName(president)}</h3>
                                <p className="text-primary font-medium">{getLocalizedRole(president)}</p>
                            </div>
                        </div>
                        <div className="space-y-6 flex-1">
                            <h2 className="text-2xl font-semibold">{t("president_speech_title")}</h2>
                            {president.description && (
                                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6 py-2">
                                    "{getLocalizedDescription(president)}"
                                </blockquote>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Executive Committee */}
            {(otherLeadership.length > 0 || committeeStaff.length > 0) && (
                <section>
                    <h2 className="text-3xl font-bold mb-8">{t("committee_title")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...otherLeadership, ...committeeStaff].map((person) => (
                            <Card key={person.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                        {person.image ? (
                                            <img
                                                src={person.image}
                                                alt={getLocalizedName(person)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <User className="w-12 h-12 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{getLocalizedName(person)}</h4>
                                        <p className="text-sm font-medium text-primary">{getLocalizedRole(person)}</p>
                                        {person.description && (
                                            <p className="text-xs text-muted-foreground mt-1">{getLocalizedDescription(person)}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Coaching Council */}
            {coachingStaff.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-8">{t("coaching_title")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coachingStaff.slice(0, 1).map((coach) => (
                            <Card key={coach.id}>
                                <CardHeader>
                                    <CardTitle>{t("head_coach_title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            {coach.image && <AvatarImage src={coach.image} alt={getLocalizedName(coach)} />}
                                            <AvatarFallback>{getLocalizedName(coach).charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold">{getLocalizedName(coach)}</div>
                                            <div className="text-sm text-muted-foreground">{getLocalizedRole(coach)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {coachingStaff.length > 1 && (
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>{t("senior_coaches_title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {coachingStaff.slice(1).map((coach) => (
                                            <div key={coach.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="font-medium">{getLocalizedRole(coach)}:</span>
                                                <span className="text-muted-foreground">{getLocalizedName(coach)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
