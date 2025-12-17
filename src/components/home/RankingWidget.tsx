import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export function RankingWidget() {
    const athletes = [
        { name: "Ильфат Абдуллин", score: 680, rank: 1, type: "Recurve", image: "https://i.pravatar.cc/150?u=ilfat" },
        { name: "Андрей Тютюн", score: 712, rank: 1, type: "Compound", image: "https://i.pravatar.cc/150?u=andrey" },
        { name: "Алина Ильясова", score: 665, rank: 2, type: "Recurve", image: "https://i.pravatar.cc/150?u=alina" },
        { name: "Акбарли Карабаев", score: 705, rank: 2, type: "Compound", image: "https://i.pravatar.cc/150?u=akbar" },
        { name: "Даулеткельди Жанбырбай", score: 678, rank: 3, type: "Recurve", image: "https://i.pravatar.cc/150?u=daulet" },
    ];

    return (
        <section className="bg-muted py-16">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">Лидеры Рейтинга</h2>

                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent>
                        {athletes.map((athlete, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                            <div className="relative mb-4">
                                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                                    <AvatarImage src={athlete.image} alt={athlete.name} />
                                                    <AvatarFallback>{athlete.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-background shadow-sm">
                                                    {athlete.rank}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg">{athlete.name}</h3>
                                            <p className="text-sm text-muted-foreground">{athlete.type}</p>
                                            <div className="mt-4 font-mono text-2xl font-bold text-primary">
                                                {athlete.score} <span className="text-xs font-normal text-muted-foreground">pts</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    );
}
