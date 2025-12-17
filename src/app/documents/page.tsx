import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Scale, Shield, PenTool } from "lucide-react";

export default function DocumentsPage() {
    const sections = [
        {
            title: "Уставные документы",
            icon: <Scale className="h-5 w-5" />,
            files: [
                "Устав Федерации (2025)",
                "Свидетельство о регистрации",
                "Свидетельство об аккредитации"
            ]
        },
        {
            title: "Правила и Регламенты",
            icon: <PenTool className="h-5 w-5" />,
            files: [
                "Правила соревнований World Athletics (2024)",
                "Регламент Чемпионатов Республики Казахстан",
                "Положение о национальной сборной"
            ]
        },
        {
            title: "Антидопинг",
            icon: <Shield className="h-5 w-5" />,
            files: [
                "Антидопинговый кодекс WADA",
                "Запрещенный список 2025",
                "Форма запроса на ТИ (TUE)"
            ]
        },
        {
            title: "Календарный план",
            icon: <Shield className="h-5 w-5" />, // Using Shield temporarily, should ideally be Calendar but not imported yet
            files: [
                "Единый республиканский календарный план 2025",
                "Календарь международных соревнований"
            ]
        },
        {
            title: "Рейтинги и Протоколы",
            icon: <FileText className="h-5 w-5" />,
            files: [
                "Текущий рейтинг атлетов (Мужчины)",
                "Текущий рейтинг атлетов (Женщины)",
                "Итоговые протоколы ЧРК 2024"
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-8">Документы</h1>
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
