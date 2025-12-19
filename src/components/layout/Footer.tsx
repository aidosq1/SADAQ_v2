import Link from "next/link";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="bg-muted/40 py-12 border-t">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{t("about")}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/about">{t("leadership")}</Link></li>
                        <li><Link href="/about">{t("history")}</Link></li>
                        <li><Link href="/about">{t("vacancies")}</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{t("athletes")}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/calendar">{t("comp_calendar")}</Link></li>
                        <li><Link href="/results">{t("protocols")}</Link></li>
                        <li><Link href="/ranking">{t("ratings")}</Link></li>
                        <li><Link href="/documents">{t("antidoping")}</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{t("contacts")}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Astana, Kazakhstan</li>
                        <li>+7 (777) 123-45-67</li>
                        <li>info@archery.kz</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{t("socials")}</h3>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/kazarchery_official" target="_blank" className="hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                        <Link href="#" className="hover:text-primary"><VkIcon /></Link>
                        <Link href="https://www.youtube.com/@QR%C5%ABlttyqsadaqatufederasiyasy" target="_blank" className="hover:text-primary"><Youtube className="h-5 w-5" /></Link>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                © 2025 {t("rights")}
            </div>
        </footer>
    );
}

function VkIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
        >
            <path d="M8.5 6a5.5 5.5 0 0 1 11 0c0 3.038-2.462 5.5-5.5 5.5H8.5" />
            <path d="M12 21v-4" />
            <path d="M12 17h-3a3 3 0 0 1-3-3v-2" />
            <path d="M12 17h3a3 3 0 0 1 3 3v2" />
        </svg>
    ) // Placeholder icon as Lucide doesn't have VK
}
