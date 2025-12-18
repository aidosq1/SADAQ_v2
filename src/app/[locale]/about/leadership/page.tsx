import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LeadershipPage() {
    const t = useTranslations("LeadershipPage");

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
            <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

            {/* President Section */}
            <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="shrink-0 mx-auto md:mx-0">
                        <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                            {/* Placeholder for President Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <User className="w-20 h-20 opacity-20" />
                            </div>
                        </div>
                        <div className="mt-4 text-center md:text-left">
                            <h3 className="text-2xl font-bold">{t("president_name")}</h3>
                            <p className="text-primary font-medium">{t("president_role")}</p>
                        </div>
                    </div>
                    <div className="space-y-6 flex-1">
                        <h2 className="text-2xl font-semibold">{t("president_speech_title")}</h2>
                        <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6 py-2">
                            "{t("president_quote")}"
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* Executive Committee */}
            <section>
                <h2 className="text-3xl font-bold mb-8">{t("committee_title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { role: t("role_vp1"), name: t("name_vp1"), desc: t("desc_vp1") },
                        { role: t("role_vp_reg"), name: t("name_vp_reg"), desc: t("desc_vp_reg") },
                        { role: t("role_sec_gen"), name: t("name_sec_gen"), desc: t("desc_sec_gen") },
                        { role: t("role_cfo"), name: t("name_cfo"), desc: t("desc_cfo") },
                    ].map((person, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                                <Avatar className="w-24 h-24">
                                    <AvatarFallback>icon</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-lg">{person.name}</h4>
                                    <p className="text-sm font-medium text-primary">{person.role}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{person.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Coaching Council */}
            <section>
                <h2 className="text-3xl font-bold mb-8">{t("coaching_title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("head_coach_title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar><AvatarFallback>GT</AvatarFallback></Avatar>
                                <div>
                                    <div className="font-bold">Имя Фамилия</div>
                                    <div className="text-sm text-muted-foreground">{t("head_coach_role")}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>{t("senior_coaches_title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[t("type_recurve"), t("type_compound"), t("type_youth"), t("type_para")].map((type, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="font-medium">{type}:</span>
                                        <span className="text-muted-foreground">Имя Фамилия</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
