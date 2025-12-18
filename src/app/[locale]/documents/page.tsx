import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Scale, Shield, PenTool } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DocumentsPage() {
    const t = useTranslations("DocumentsPage");

    const sections = [
        {
            title: t("sec_statute"),
            icon: <Scale className="h-5 w-5" />,
            files: [
                t("file_statute"),
                t("file_reg_cert"),
                t("file_acc_cert"),
            ]
        },
        {
            title: t("sec_rules"),
            icon: <PenTool className="h-5 w-5" />,
            files: [
                t("file_wa_rules"),
                t("file_rk_rules"),
                t("file_national_reg"),
            ]
        },
        {
            title: t("sec_antidoping"),
            icon: <Shield className="h-5 w-5" />,
            files: [
                t("file_wada_code"),
                t("file_prohibited"),
                t("file_tue"),
            ]
        },
        {
            title: t("sec_calendar"),
            icon: <Shield className="h-5 w-5" />, // Using Shield temporarily, should ideally be Calendar but not imported yet
            files: [
                t("file_calendar_2025"),
                t("file_intl_calendar"),
            ]
        },
        {
            title: t("sec_ratings"),
            icon: <FileText className="h-5 w-5" />,
            files: [
                t("file_rating_men"),
                t("file_rating_women"),
                t("file_protocols_2024"),
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <Card key={idx}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">{section.icon} {section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {section.files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted border border-transparent hover:border-gray-200 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                            <span className="truncate text-sm font-medium">{file}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
