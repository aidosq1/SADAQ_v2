import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function ResultsPage() {
    const archives = [
        {
            year: "2024",
            events: [
                { name: "Кубок Республики Казахстан", date: "10-15 Декабря", city: "Астана" },
                { name: "Летний Чемпионат РК", date: "15-20 Августа", city: "Алматы" },
                { name: "Турнир памяти А. Овчинникова", date: "05-10 Июня", city: "Темиртау" },
            ]
        },
        {
            year: "2023",
            events: [
                { name: "Чемпионат РК в помещении", date: "20-25 Февраля", city: "Шымкент" },
                { name: "Спартакиада Народов", date: "10-20 Сентября", city: "Алматы" },
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Архив Протоколов</h1>

            <Accordion type="single" collapsible className="w-full" defaultValue="2024">
                {archives.map((yearData) => (
                    <AccordionItem key={yearData.year} value={yearData.year}>
                        <AccordionTrigger className="text-xl font-bold">Сезон {yearData.year}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                {yearData.events.map((event, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                        <div className="mb-2 sm:mb-0">
                                            <h3 className="font-bold text-lg">{event.name}</h3>
                                            <p className="text-sm text-muted-foreground">{event.date} • {event.city}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline"><FileText className="h-4 w-4 mr-2" /> Протокол (PDF)</Button>
                                            <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
