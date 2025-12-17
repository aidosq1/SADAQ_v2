import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function TeamPage() {
    const athletes = [
        { id: "1", name: "Ильфат Абдуллин", type: "Recurve", image: "https://i.pravatar.cc/150?u=ilfat" },
        { id: "2", name: "Андрей Тютюн", type: "Compound", image: "https://i.pravatar.cc/150?u=andrey" },
        { id: "3", name: "Алина Ильясова", type: "Recurve", image: "https://i.pravatar.cc/150?u=alina" },
        { id: "4", name: "Акбарли Карабаев", type: "Compound", image: "https://i.pravatar.cc/150?u=akbar" },
        { id: "5", name: "Даулеткельди Жанбырбай", type: "Recurve", image: "https://i.pravatar.cc/150?u=daulet" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-8">Сборная Команда</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {athletes.map((athlete) => (
                    <Link key={athlete.id} href={`/team/${athlete.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardContent className="pt-6 flex flex-col items-center">
                                <Avatar className="h-32 w-32 mb-4">
                                    <AvatarImage src={athlete.image} alt={athlete.name} />
                                    <AvatarFallback>{athlete.name[0]}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-lg text-center">{athlete.name}</h3>
                                <p className="text-sm text-muted-foreground">{athlete.type}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
