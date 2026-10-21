"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, User } from "lucide-react";

import { Link, usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV, isActivePath, isGroup, type NavEntry, type NavItem } from "./nav";

function MobileLink({ item, label, pathname, onNavigate }: {
    item: NavItem;
    label: string;
    pathname: string;
    onNavigate: () => void;
}) {
    const active = isActivePath(pathname, item.href);

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex h-11 items-center rounded-md px-3 text-[0.9375rem] font-medium transition-colors",
                active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-secondary"
            )}
        >
            {label}
        </Link>
    );
}

interface MenuSection {
    labelKey?: string;
    items: NavItem[];
}

// Группы меню идут со своим заголовком, одиночные пункты подряд — одним блоком без заголовка
function toSections(entries: NavEntry[]): MenuSection[] {
    return entries.reduce<MenuSection[]>((sections, entry) => {
        if (isGroup(entry)) return [...sections, { labelKey: entry.labelKey, items: entry.items }];
        const last = sections.at(-1);
        if (last && !last.labelKey) return [...sections.slice(0, -1), { items: [...last.items, entry] }];
        return [...sections, { items: [entry] }];
    }, []);
}

const SECTIONS = toSections(NAV);

// Меню для экранов уже 1024px: панель справа с разделами, языком и входом
export function MobileMenu() {
    const t = useTranslations("Header");
    const { data: session } = useSession();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] gap-0 p-0 sm:max-w-sm">
                <div className="flex h-18 items-center gap-3 border-b px-5">
                    <Image src="/logo_federation_circular.png" alt="" width={40} height={40} className="size-10" />
                    <SheetTitle className="font-heading text-sm leading-tight font-bold">{t("logo_name")}</SheetTitle>
                </div>

                <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
                    {SECTIONS.map((section) => (
                        <div key={section.labelKey ?? section.items[0].href}>
                            {section.labelKey && (
                                <p className="type-eyebrow px-3 pb-1.5 text-muted-foreground">{t(section.labelKey)}</p>
                            )}
                            {section.items.map((item) => (
                                <MobileLink
                                    key={item.href}
                                    item={item}
                                    label={t(item.labelKey)}
                                    pathname={pathname}
                                    onNavigate={close}
                                />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
                    <LanguageSwitcher />
                    {session ? (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/dashboard" onClick={close}>
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
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/auth/signin" onClick={close}>
                                <User />
                                {t("login")}
                            </Link>
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
