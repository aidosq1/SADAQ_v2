"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";

import { Link, usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NAV, isActivePath, isEntryActive, isGroup } from "./nav";

// Пункт меню: активный раздел подчёркнут бордовой чертой по нижнему краю шапки
const NAV_LINK =
    "relative flex h-18 items-center gap-1 px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors";

function navLinkClass(active: boolean): string {
    return cn(
        NAV_LINK,
        active
            ? "text-foreground after:bg-primary"
            : "text-muted-foreground hover:text-foreground after:bg-transparent"
    );
}

function AccountActions() {
    const t = useTranslations("Header");
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className="size-9" aria-hidden="true" />;
    }

    if (session) {
        return (
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" asChild>
                    <Link href="/admin/dashboard" aria-label={t("admin")} title={t("admin")}>
                        <User />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    title={t("logout")}
                    aria-label={t("logout")}
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut />
                </Button>
            </div>
        );
    }

    return (
        <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/auth/signin" aria-label={t("login")} title={t("login")}>
                <User />
            </Link>
        </Button>
    );
}

export function Header() {
    const t = useTranslations("Header");
    const pathname = usePathname();

    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
            <Container className="flex h-18 items-center justify-between gap-4">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <Image
                        src="/logo_federation_circular.png"
                        alt="SADAQ"
                        width={48}
                        height={48}
                        priority
                        className="size-11 shrink-0 object-contain md:size-12"
                    />
                    <span className="hidden max-w-[210px] font-heading text-sm leading-snug font-bold text-balance text-foreground sm:block lg:hidden xl:block">
                        {t("logo_name")}
                    </span>
                </Link>

                <nav className="hidden items-center lg:flex" aria-label="Main">
                    {NAV.map((entry) =>
                        isGroup(entry) ? (
                            <DropdownMenu key={entry.labelKey} modal={false}>
                                <DropdownMenuTrigger className={navLinkClass(isEntryActive(pathname, entry))}>
                                    {t(entry.labelKey)}
                                    <ChevronDown className="size-3.5 opacity-60" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[220px]">
                                    {entry.items.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "w-full",
                                                    isActivePath(pathname, item.href) && "font-semibold text-primary"
                                                )}
                                            >
                                                {t(item.labelKey)}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={entry.href}
                                href={entry.href}
                                aria-current={isActivePath(pathname, entry.href) ? "page" : undefined}
                                className={navLinkClass(isActivePath(pathname, entry.href))}
                            >
                                {t(entry.labelKey)}
                            </Link>
                        )
                    )}
                </nav>

                <div className="flex shrink-0 items-center gap-2">
                    <LanguageSwitcher className="hidden md:inline-flex" />
                    <div className="hidden lg:block">
                        <AccountActions />
                    </div>
                    <MobileMenu />
                </div>
            </Container>
        </header>
    );
}
