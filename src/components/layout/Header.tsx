"use client";

import Image from "next/image";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { Menu, ChevronDown, User, LogOut, Instagram, Youtube } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
    name: string;
    href: string;
}

const NAV_LINK =
    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/40";

function isActive(pathname: string, items: NavItem[]): boolean {
    return items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function NavDropdown({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(NAV_LINK, isActive(pathname, items) ? "text-primary" : "text-foreground")}
            >
                {label} <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
                {items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="w-full cursor-pointer">
                            {item.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header() {
    const { language, setLanguage } = useLanguage();
    const t = useTranslations("Header");
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { name: t("team"), href: "/team" },
        { name: t("ranking"), href: "/ranking" },
    ];

    const calendarItems: NavItem[] = [
        { name: t("competitions"), href: "/calendar" },
        { name: t("protocols"), href: "/results" },
    ];

    const aboutItems: NavItem[] = [
        { name: t("about"), href: "/about" },
        { name: t("leadership"), href: "/about/leadership" },
        { name: t("regions"), href: "/about/regions" },
        { name: t("history"), href: "/about/history" },
        { name: t("documents"), href: "/documents" },
    ];

    const mediaItems: NavItem[] = [
        { name: t("news"), href: "/media/news" },
        { name: t("media_gallery"), href: "/media/gallery" },
    ];

    const mobileGroups = [aboutItems, calendarItems, navItems, mediaItems];

    const languages = [
        { code: 'kk', label: 'ҚАЗ' },
        { code: 'ru', label: 'РУС' },
        { code: 'en', label: 'ENG' },
    ];

    return (
        <header className="fixed top-0 z-50 w-full">
            {/* Top Bar */}
            <div className="bg-primary text-primary-foreground">
                <Container className="flex h-8 items-center justify-between text-xs">
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://www.instagram.com/kazarchery_official/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="transition-colors hover:text-gold"
                        >
                            <Instagram className="size-4" />
                        </a>
                        <a
                            href="https://www.youtube.com/watch?v=6xgw-YxIbmw"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                            className="transition-colors hover:text-gold"
                        >
                            <Youtube className="size-4" />
                        </a>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center divide-x divide-white/25">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                aria-current={language === lang.code ? "true" : undefined}
                                className={cn(
                                    "cursor-pointer px-2.5 font-medium transition-colors",
                                    language === lang.code
                                        ? "font-semibold text-gold"
                                        : "text-white/75 hover:text-white"
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Main Bar */}
            <div className="border-b bg-background shadow-sm">
                <Container className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        <Image
                            src="/logo_federation_circular.png"
                            alt="SADAQ Logo"
                            width={56}
                            height={56}
                            className="h-14 w-auto object-contain"
                        />
                        <div className="hidden flex-col leading-tight lg:flex">
                            <span className="type-eyebrow text-muted-foreground">{t("logo_country")}</span>
                            <span className="font-heading text-sm font-bold text-primary">{t("logo_name")}</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                        <NavDropdown label={t("about")} items={aboutItems} pathname={pathname} />
                        <NavDropdown label={t("tournaments")} items={calendarItems} pathname={pathname} />

                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(NAV_LINK, isActive(pathname, [item]) ? "text-primary" : "text-foreground")}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <NavDropdown label={t("media")} items={mediaItems} pathname={pathname} />
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {status === "loading" ? (
                            <Button variant="outline" size="sm" disabled className="hidden sm:flex">
                                ...
                            </Button>
                        ) : session ? (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/dashboard">
                                        <User />
                                        {t("admin")}
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={t("logout")}
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                >
                                    <LogOut />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                                <Link href="/auth/signin">{t("login")}</Link>
                            </Button>
                        )}

                        {/* Mobile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-primary md:hidden" aria-label="Menu">
                                    <Menu className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {mobileGroups.map((group, index) => (
                                    <div key={group[0].href}>
                                        {index > 0 && <DropdownMenuSeparator />}
                                        {group.map((item) => (
                                            <DropdownMenuItem key={item.href} asChild>
                                                <Link href={item.href}>{item.name}</Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                ))}
                                <DropdownMenuSeparator />
                                {session ? (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard">
                                                <User />
                                                {t("admin")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                                            <LogOut />
                                            {t("logout")}
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem asChild>
                                        <Link href="/auth/signin">{t("login")}</Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Container>
            </div>
        </header>
    );
}
