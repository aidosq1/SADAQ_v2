import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, FileText, Play, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

export function CalendarWidget() {
    const t = useTranslations("CalendarWidget");
    const t_regions = useTranslations("Regions");

    return (
        <div className="flex flex-col h-full justify-center">
            {/* Title for consistency if side-by-side */}
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
                <Button variant="ghost" asChild>
                    <Link href="/calendar">{t("all_events")}</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Past Event */}
                <Card className="border-l-4 border-l-gray-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("status_past")}</CardTitle>
                        <Trophy className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{t("event_fed_cup")}</div>
                        <p className="text-xs text-muted-foreground mb-4">{t("date_fed_cup")}, {t_regions("astana")}</p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/results"><FileText className="mr-2 h-3 w-3" /> {t("btn_protocol")}</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Current Event */}
                <Card className="border-l-4 border-l-green-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {t("status_current")}
                        </CardTitle>
                        <Play className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{t("event_winter_champ")}</div>
                        <p className="text-xs text-muted-foreground mb-4">{t("date_winter_champ")}, {t_regions("shymkent")}</p>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/media"><Play className="mr-2 h-3 w-3" /> {t("btn_watch")}</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Future Event */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">{t("status_future")}</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{t("event_asian_champ")}</div>
                        <p className="text-xs text-muted-foreground mb-4">{t("date_asian_champ")}, {t_regions("shymkent")}</p> {/* Changed Bangkok to Shymkent for example or use a translatable city key */}
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/calendar"><FileText className="mr-2 h-3 w-3" /> {t("btn_regulations")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}
