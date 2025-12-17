import Link from "next/link";
import { Facebook, Globe, Instagram } from "lucide-react";

export function PartnersBlock() {
    const partners = [
        {
            name: "SPORT QORY",
            contacts: {
                instagram: { label: "@sportqory", url: "https://instagram.com/sportqory" },
                facebook: { label: "@sportqory", url: "https://facebook.com/sportqory" },
                website: { label: "sportqory.kz", url: "https://sportqory.kz" }
            }
        }
    ];

    return (
        <section className="bg-background py-16 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-center text-muted-foreground opacity-50">Наши партнеры</h2>
                <div className="flex flex-wrap justify-center items-center gap-12">
                    {partners.map((partner, i) => (
                        <div key={i} className="flex flex-col items-center p-8 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
                            <div className="text-3xl font-black text-foreground mb-6 tracking-tight">
                                {partner.name}
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <Link
                                    href={partner.contacts.website.url}
                                    target="_blank"
                                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="font-medium">{partner.contacts.website.label}</span>
                                </Link>

                                <div className="flex gap-2 justify-center w-full pt-2 border-t border-border/50">
                                    <Link
                                        href={partner.contacts.instagram.url}
                                        target="_blank"
                                        className="p-2 text-muted-foreground hover:text-[#E1306C] transition-colors hover:bg-muted rounded-md"
                                        title="Instagram"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={partner.contacts.facebook.url}
                                        target="_blank"
                                        className="p-2 text-muted-foreground hover:text-[#1877F2] transition-colors hover:bg-muted rounded-md"
                                        title="Facebook"
                                    >
                                        <Facebook className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
