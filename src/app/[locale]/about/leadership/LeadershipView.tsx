"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PersonPlaceholder } from "@/components/ui/person-placeholder";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export interface Staff {
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

interface LeadershipViewProps {
    initialStaff?: Staff[];
}

export default function LeadershipView({ initialStaff }: LeadershipViewProps) {
    const t = useTranslations("LeadershipPage");
    const locale = useLocale();
    const [staff, setStaff] = useState<Staff[]>(initialStaff ?? []);
    const [loading, setLoading] = useState(!initialStaff);

    useEffect(() => {
        // Данные пришли с сервера вместе с HTML
        if (initialStaff) return;
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
    }, [initialStaff]);

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
            <PageContainer>
                <PageHeader title={t("title")} />
                <LoadingState className="min-h-[400px]" />
            </PageContainer>
        );
    }

    if (staff.length === 0) {
        return (
            <PageContainer>
                <PageHeader title={t("title")} />
                <EmptyState
                    icon={Users}
                    title={locale === 'kk' ? 'Деректер жоқ' : locale === 'en' ? 'No data available' : 'Данные не найдены'}
                />
            </PageContainer>
        );
    }

    const committee = [...otherLeadership, ...committeeStaff];

    return (
        <PageContainer className="space-y-12 md:space-y-16">
            <PageHeader title={t("title")} />

            {president && (
                <section className="surface-inverse grid overflow-hidden rounded-2xl md:grid-cols-12">
                    <div className="relative aspect-[4/5] bg-white/5 md:col-span-5 md:aspect-auto md:min-h-[420px] lg:col-span-4">
                        {president.image ? (
                            <Image
                                src={president.image}
                                alt={getLocalizedName(president)}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <PersonPlaceholder className="size-24 text-white/30" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-end gap-3 p-6 md:col-span-7 md:p-10 lg:col-span-8 lg:p-14">
                        <Eyebrow tone="inverse">{getLocalizedRole(president)}</Eyebrow>
                        <h2 className="type-h1 text-white">{getLocalizedName(president)}</h2>
                        {president.description && (
                            <p className="type-lead max-w-xl text-white/70">{getLocalizedDescription(president)}</p>
                        )}
                    </div>
                </section>
            )}

            {committee.length > 0 && (
                <section>
                    <SectionHeader title={t("committee_title")} />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {committee.map((person) => (
                            <Card key={person.id} className="items-center gap-4 px-6 text-center">
                                <PersonAvatar src={person.image} alt={getLocalizedName(person)} className="size-28" />
                                <div className="space-y-1">
                                    <h3 className="type-h4 text-foreground">{getLocalizedName(person)}</h3>
                                    <p className="type-small font-medium text-primary">{getLocalizedRole(person)}</p>
                                    {person.description && (
                                        <p className="type-caption">{getLocalizedDescription(person)}</p>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {coachingStaff.length > 0 && (
                <section>
                    <SectionHeader title={t("national_coach_title")} />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {coachingStaff.map((coach) => (
                            <Card key={coach.id} className="flex-row items-center gap-4 px-6">
                                <PersonAvatar src={coach.image} alt={getLocalizedName(coach)} className="size-14" />
                                <div className="min-w-0 flex-1">
                                    <h3 className="type-h4 truncate text-foreground">{getLocalizedName(coach)}</h3>
                                    <p className="type-small font-medium text-primary">{getLocalizedRole(coach)}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </PageContainer>
    );
}
