import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import KazakhstanMap from "@/components/KazakhstanMap";

export default function RegionsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Региональные филиалы</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Федерация представлена в 20 регионах страны. Найдите контакты ближайшего к вам филиала.
                </p>
            </div>

            {/* Interactive Map */}
            <div className="w-full h-auto min-h-[600px] bg-muted/5 rounded-3xl overflow-hidden shadow-sm relative">
                <KazakhstanMap />
            </div>

            {/* Branches List Example */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Контактная информация</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            city: "г. Астана",
                            director: "Ахметов Серик",
                            address: "пр. Туран, 4/2, Легкоатлетический комплекс 'Qazaqstan'",
                            phone: "+7 (7172) 55-55-55"
                        },
                        {
                            city: "г. Алматы",
                            director: "Иванова Елена",
                            address: "ул. Сатпаева, 29/3, Центральный стадион",
                            phone: "+7 (727) 333-22-11"
                        },
                        {
                            city: "г. Шымкент",
                            director: "Сапаров Болат",
                            address: "ул. Мадели Кожа, 1, Стадион им. Кажимукана",
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
                                        <div className="text-xs text-muted-foreground">Директор филиала</div>
                                        <div className="font-medium">{branch.director}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Адрес</div>
                                        <div className="text-sm">{branch.address}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Телефон</div>
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
