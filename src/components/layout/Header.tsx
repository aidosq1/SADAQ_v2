"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Search, Globe, Menu, ChevronDown } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {

    const navItems = [
        { name: "Соревнования", href: "/calendar" },
        { name: "Сборная", href: "/team" },
        { name: "Рейтинги", href: "/ranking" },
        { name: "Медиа", href: "/media" },
    ];

    const aboutItems = [
        { name: "О Нас", href: "/about" },
        { name: "Руководство", href: "/about/leadership" },
        { name: "Регионы", href: "/about/regions" },
        { name: "История", href: "/about/history" },
        { name: "Документы", href: "/documents" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-tight">KAF</span>
                </Link>

                <nav className="hidden md:flex gap-6 items-center">
                    {/* About Federation Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground focus:outline-none">
                            О Федерации <ChevronDown className="h-4 w-4" />
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
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Globe className="h-4 w-4" />
                        <span className="sr-only">Language</span>
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                        <Link href="/calendar/register">Подать заявку</Link>
                    </Button>


                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>


        </header>
    );
}
