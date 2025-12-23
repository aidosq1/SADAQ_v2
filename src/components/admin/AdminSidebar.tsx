"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  UserCog,
  Trophy,
  Handshake,
  FileText,
  Images,
  LogOut,
  CalendarDays,
  FileEdit,
  ClipboardCheck,
  Medal,
  Scale,
  MapPin,
  Menu,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale } from "next-intl";

type UserRole = "Admin" | "Editor" | "RegionalRepresentative";

interface MenuItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  allowedRoles: UserRole[];
}

const menuItems: MenuItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, labelKey: "dashboard", allowedRoles: ["Admin", "Editor", "RegionalRepresentative"] },
  { href: "/admin/tournaments", icon: CalendarDays, labelKey: "tournaments", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/registrations", icon: ClipboardCheck, labelKey: "registrations", allowedRoles: ["Admin", "Editor", "RegionalRepresentative"] },
  { href: "/admin/results", icon: Medal, labelKey: "results", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/news", icon: Newspaper, labelKey: "news", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/team", icon: Users, labelKey: "team", allowedRoles: ["Admin", "Editor", "RegionalRepresentative"] },
  { href: "/admin/coaches", icon: UserCog, labelKey: "coaches", allowedRoles: ["Admin", "Editor", "RegionalRepresentative"] },
  { href: "/admin/judges", icon: Scale, labelKey: "judges", allowedRoles: ["Admin", "Editor", "RegionalRepresentative"] },
  { href: "/admin/rankings", icon: Trophy, labelKey: "rankings", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/partners", icon: Handshake, labelKey: "partners", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/documents", icon: FileText, labelKey: "documents", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/gallery", icon: Images, labelKey: "gallery", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/content", icon: FileEdit, labelKey: "content", allowedRoles: ["Admin", "Editor"] },
  { href: "/admin/regions", icon: MapPin, labelKey: "regions", allowedRoles: ["Admin"] },
];

const labels: Record<string, Record<string, string>> = {
  dashboard: { ru: "Главная", kk: "Басты бет", en: "Dashboard" },
  tournaments: { ru: "Турниры", kk: "Турнирлер", en: "Tournaments" },
  registrations: { ru: "Заявки", kk: "Өтінімдер", en: "Registrations" },
  results: { ru: "Результаты", kk: "Нәтижелер", en: "Results" },
  news: { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  team: { ru: "Команда", kk: "Команда", en: "Team" },
  coaches: { ru: "Тренеры", kk: "Жаттықтырушылар", en: "Coaches" },
  judges: { ru: "Судьи", kk: "Төрешілер", en: "Judges" },
  rankings: { ru: "Рейтинг", kk: "Рейтинг", en: "Rankings" },
  partners: { ru: "Партнёры", kk: "Серіктестер", en: "Partners" },
  documents: { ru: "Документы", kk: "Құжаттар", en: "Documents" },
  gallery: { ru: "Галерея", kk: "Галерея", en: "Gallery" },
  content: { ru: "Контент", kk: "Контент", en: "Content" },
  regions: { ru: "Регионы", kk: "Аймақтар", en: "Regions" },
};

interface AdminSidebarProps {
  userRole?: string;
  userRegion?: string | null;
}

// Shared navigation component
function SidebarNav({
  userRole,
  userRegion,
  onItemClick,
}: {
  userRole: string;
  userRegion?: string | null;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const locale = useLocale();

  const visibleMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole as UserRole)
  );

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2" onClick={onItemClick}>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <span className="font-bold text-lg">SADAQ</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
        {userRegion && (
          <p className="text-xs text-muted-foreground mt-2 px-1">{userRegion}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {visibleMenuItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              onClick={onItemClick}
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
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          {locale === "kk" ? "Шығу" : locale === "en" ? "Sign Out" : "Выйти"}
        </Button>
      </div>
    </>
  );
}

// Mobile Menu Trigger with Sheet
export function AdminMobileMenuTrigger({
  userRole = "RegionalRepresentative",
  userRegion,
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4 flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
        </SheetHeader>
        <SidebarNav
          userRole={userRole}
          userRegion={userRegion}
          onItemClick={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export function AdminSidebar({
  userRole = "RegionalRepresentative",
  userRegion,
}: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 bg-card border-r min-h-screen p-4 flex-col">
      <SidebarNav userRole={userRole} userRegion={userRegion} />
    </aside>
  );
}
