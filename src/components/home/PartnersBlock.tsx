import Image from "next/image";

export function PartnersBlock() {
    const partners = [
        "World Archery", "NOC Kazakhstan", "Samruk Kazyna", "Sport Qory"
    ];

    return (
        <section className="bg-background py-16 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-center text-muted-foreground opacity-50">Наши партнеры</h2>
                <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    {partners.map((partner, i) => (
                        <div key={i} className="text-xl font-bold text-muted-foreground border border-border p-6 rounded-lg min-w-[200px] text-center">
                            {partner}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
