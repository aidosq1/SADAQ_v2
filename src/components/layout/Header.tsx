"use client";

import Image from "next/image";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";

import { Button } from "@/components/ui/button";
import { Search, Globe, Menu, ChevronDown } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { language, setLanguage } = useLanguage();
    const t = useTranslations("Header");
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const navItems = [
        { name: t("competitions"), href: "/calendar" },
        { name: t("team"), href: "/team" },
        { name: t("ranking"), href: "/ranking" },
        { name: t("media"), href: "/media" },
    ];

    const aboutItems = [
        { name: t("about"), href: "/about" },
        { name: t("leadership"), href: "/about/leadership" },
        { name: t("regions"), href: "/about/regions" },
        { name: t("history"), href: "/about/history" },
        { name: t("documents"), href: "/documents" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#7B1B1B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#7B1B1B]/90 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo_federation.png"
                        alt="SADAQ Logo"
                        width={48}
                        height={48}
                        className="h-10 w-auto object-contain"
                    />
                    <span className="font-bold text-lg tracking-tight hidden sm:block">Qazaqstan Archery</span>
                </Link>

                <nav className="hidden md:flex gap-6 items-center">
                    {/* About Federation Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white/80 text-white focus:outline-none">
                            {t("about")} <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {aboutItems.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href} className="w-full cursor-pointer">{item.name}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {navItems.map((item) => (
                        item.name === t("media") ? (
                            <DropdownMenu key={item.href}>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white/80 text-white focus:outline-none">
                                    {item.name} <ChevronDown className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem asChild>
                                        <Link href="/media/news" className="w-full cursor-pointer">{t("news")}</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/media/gallery" className="w-full cursor-pointer">{t("media_gallery")}</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium transition-colors hover:text-white/80 text-white"
                            >
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hidden sm:flex text-white hover:bg-white/10 hover:text-white">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-white hover:bg-white/10 hover:text-white gap-2 font-medium">
                                <Globe className="h-4 w-4" />
                                {language.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLanguage('kk')}>
                                <span className={language === 'kk' ? "font-bold" : ""}>Қазақша</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('ru')}>
                                <span className={language === 'ru' ? "font-bold" : ""}>Русский</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('en')}>
                                <span className={language === 'en' ? "font-bold" : ""}>English</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                        onClick={() => setIsAuthModalOpen(true)}
                    >
                        {t("login")}
                    </Button>

                    <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 hover:text-white">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </header>
    );
}
