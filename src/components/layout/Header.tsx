"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, User, LogOut, Instagram, Youtube } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { language, setLanguage } = useLanguage();
    const t = useTranslations("Header");
    const { data: session, status } = useSession();

    const navItems = [
        { name: t("competitions"), href: "/calendar" },
        { name: t("team"), href: "/team" },
        { name: t("ranking"), href: "/ranking" },
    ];

    const aboutItems = [
        { name: t("about"), href: "/about" },
        { name: t("leadership"), href: "/about/leadership" },
        { name: t("regions"), href: "/about/regions" },
        { name: t("history"), href: "/about/history" },
        { name: t("documents"), href: "/documents" },
    ];

    const mediaItems = [
        { name: t("news"), href: "/media/news" },
        { name: t("media_gallery"), href: "/media/gallery" },
    ];

    const languages = [
        { code: 'kk', label: 'ҚАЗ' },
        { code: 'ru', label: 'РУС' },
        { code: 'en', label: 'ENG' },
    ];

    return (
        <header className="fixed top-0 z-50 w-full">
            {/* Top Bar - Navy */}
            <div className="bg-[hsl(var(--official-navy))] text-white">
                <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-xs">
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://instagram.com/sadaqatu_kz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[hsl(var(--official-gold))] transition-colors"
                        >
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a
                            href="https://youtube.com/@sadaqatu_kz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[hsl(var(--official-gold))] transition-colors"
                        >
                            <Youtube className="h-4 w-4" />
                        </a>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1">
                        {languages.map((lang, index) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`px-2 py-1 transition-colors ${
                                    language === lang.code
                                        ? 'text-[hsl(var(--official-gold))] font-semibold'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                {lang.label}
                                {index < languages.length - 1 && (
                                    <span className="ml-2 text-white/30">|</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Bar - White */}
            <div className="bg-white shadow-sm border-b border-[hsl(var(--border-light))]">
                <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        <Image
                            src="/logo_federation_circular.png"
                            alt="SADAQ Logo"
                            width={48}
                            height={48}
                            className="h-11 w-auto object-contain"
                        />
                        <div className="hidden lg:flex flex-col leading-tight">
                            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                                {language === 'kk' ? 'Қазақстан Республикасының' : language === 'en' ? 'Republic of Kazakhstan' : 'Республики Казахстан'}
                            </span>
                            <span className="text-sm font-semibold text-[hsl(var(--official-navy))] tracking-tight">
                                {language === 'kk' ? 'Ұлттық Садақ Ату Федерациясы' : language === 'en' ? 'National Archery Federation' : 'Национальная Федерация Стрельбы из Лука'}
                            </span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex gap-1 lg:gap-2 items-center">
                        {/* About Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[hsl(var(--official-navy))] hover:text-[hsl(var(--official-blue))] transition-colors focus:outline-none">
                                {t("about")} <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[200px]">
                                {aboutItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="w-full cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Regular Nav Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-3 py-2 text-sm font-medium text-[hsl(var(--official-navy))] hover:text-[hsl(var(--official-blue))] transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Media Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[hsl(var(--official-navy))] hover:text-[hsl(var(--official-blue))] transition-colors focus:outline-none">
                                {t("media")} <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {mediaItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="w-full cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {status === "loading" ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="hidden sm:flex opacity-50"
                            >
                                ...
                            </Button>
                        ) : session ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[hsl(var(--official-navy))] text-[hsl(var(--official-navy))] hover:bg-[hsl(var(--official-navy))] hover:text-white"
                                    asChild
                                >
                                    <Link href="/admin/dashboard">
                                        <User className="h-4 w-4 mr-1" />
                                        {t("admin")}
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[hsl(var(--official-navy))] hover:bg-[hsl(var(--light-gray))]"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex border-[hsl(var(--official-navy))] text-[hsl(var(--official-navy))] hover:bg-[hsl(var(--official-navy))] hover:text-white"
                                asChild
                            >
                                <Link href="/auth/signin">{t("login")}</Link>
                            </Button>
                        )}

                        {/* Mobile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden text-[hsl(var(--official-navy))]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {aboutItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                                <div className="h-px bg-border my-1" />
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                                <div className="h-px bg-border my-1" />
                                {mediaItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                                {session && (
                                    <>
                                        <div className="h-px bg-border my-1" />
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard">
                                                <User className="h-4 w-4 mr-2" />
                                                {t("admin")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {t("logout")}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
