"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Image,
  Users,
  Trophy,
  Handshake,
  FileText,
  Images,
  UserCog,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";

const menuItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/news", icon: Newspaper, labelKey: "news" },
  { href: "/admin/slides", icon: Image, labelKey: "slides" },
  { href: "/admin/team", icon: Users, labelKey: "team" },
  { href: "/admin/staff", icon: UserCog, labelKey: "staff" },
  { href: "/admin/rankings", icon: Trophy, labelKey: "rankings" },
  { href: "/admin/partners", icon: Handshake, labelKey: "partners" },
  { href: "/admin/documents", icon: FileText, labelKey: "documents" },
  { href: "/admin/gallery", icon: Images, labelKey: "gallery" },
];

const labels: Record<string, Record<string, string>> = {
  dashboard: { ru: "Главная", kk: "Басты бет", en: "Dashboard" },
  news: { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  slides: { ru: "Слайдер", kk: "Слайдер", en: "Slides" },
  team: { ru: "Команда", kk: "Команда", en: "Team" },
  staff: { ru: "Персонал", kk: "Қызметкерлер", en: "Staff" },
  rankings: { ru: "Рейтинг", kk: "Рейтинг", en: "Rankings" },
  partners: { ru: "Партнёры", kk: "Серіктестер", en: "Partners" },
  documents: { ru: "Документы", kk: "Құжаттар", en: "Documents" },
  gallery: { ru: "Галерея", kk: "Галерея", en: "Gallery" },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <span className="font-bold text-lg">SADAQ</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {labels[item.labelKey]?.[locale] || labels[item.labelKey]?.ru}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3" asChild>
          <Link href="/api/auth/signout">
            <LogOut className="h-5 w-5" />
            {locale === "kk" ? "Шығу" : locale === "en" ? "Sign Out" : "Выйти"}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
