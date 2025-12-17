import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
    const events = [
        {
            year: "1950",
            title: "Начало пути",
            description: "Основание первой республиканской секции легкой атлетики. Первые победы казахстанских спортсменов на спартакиадах народов СССР. Формирование базовой инфраструктуры."
        },
        {
            year: "1992",
            title: "Независимый старт",
            description: "Официальное создание Федерации Легкой Атлетики Республики Казахстан как независимой организации. Вступление в IAAF (ныне World Athletics) и признание мировым сообществом."
        },
        {
            year: "1996",
            title: "Первое Олимпийское золото",
            description: "Исторический момент для нашей страны. Победа на Олимпийских играх, ознаменовавшая выход казахстанской атлетики на мировой уровень."
        },
        {
            year: "2010",
            title: "Эра развития",
            description: "Проведение крупного Чемпионата Азии в закрытых помещениях в Казахстане. Строительство новых легкоатлетических манежей международного класса."
        },
        {
            year: "Наши дни",
            title: "Путь в будущее",
            description: "Сегодня Федерация — это мощная структура, объединяющая тысячи профессионалов. Мы внедряем цифровые технологии, развиваем детский спорт и готовим новую плеяду олимпийских чемпионов.",
            isLast: true
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-16">История Федерации</h1>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 md:translate-x-0" />

                <div className="space-y-12">
                    {events.map((event, index) => (
                        <div key={index} className={`relative flex flex-col md:flex-row gap-8 items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                            {/* Timeline Dot */}
                            <div className="absolute left-[15px] md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10 top-6 md:top-auto" />

                            {/* Date Badge (Mobile) */}
                            <div className="md:hidden pl-10">
                                <Badge variant="secondary" className="text-lg px-4 py-1">{event.year}</Badge>
                            </div>

                            {/* Content Card */}
                            <div className="ml-10 md:ml-0 md:w-1/2 md:px-8">
                                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Date Badge (Desktop) - Positioned based on alignment */}
                                    <div className={`hidden md:block absolute top-4 ${index % 2 === 0 ? 'left-4' : 'right-4'}`}>
                                        <Badge variant="outline" className="font-bold">{event.year}</Badge>
                                    </div>

                                    <CardContent className="pt-6 md:pt-10">
                                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {event.description}
                                        </p>
                                    </CardContent>

                                    {/* Decorative gradient */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${index % 2 === 0 ? 'from-primary to-transparent' : 'from-transparent to-primary'}`} />
                                </Card>
                            </div>

                            {/* Empty space for the other side of the timeline */}
                            <div className="hidden md:block md:w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
