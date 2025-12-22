import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Newspaper, Users, Trophy, Handshake, FileText, Images, UserCog } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";

async function getStats() {
  const [news, team, staff, partners, documents, gallery, rankings] = await Promise.all([
    prisma.news.count(),
    prisma.nationalTeamMembership.count({ where: { isActive: true } }),
    prisma.staff.count(),
    prisma.partner.count(),
    prisma.document.count(),
    prisma.gallery.count(),
    prisma.rankingEntry.count(),
  ]);

  return { news, team, staff, partners, documents, gallery, rankings };
}

const statCards = [
  { key: "news", icon: Newspaper, href: "/admin/news", color: "text-blue-500" },
  { key: "team", icon: Users, href: "/admin/team", color: "text-green-500" },
  { key: "staff", icon: UserCog, href: "/admin/staff", color: "text-orange-500" },
  { key: "rankings", icon: Trophy, href: "/admin/rankings", color: "text-yellow-500" },
  { key: "partners", icon: Handshake, href: "/admin/partners", color: "text-pink-500" },
  { key: "documents", icon: FileText, href: "/admin/documents", color: "text-cyan-500" },
  { key: "gallery", icon: Images, href: "/admin/gallery", color: "text-indigo-500" },
];

const labels: Record<string, Record<string, string>> = {
  news: { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  team: { ru: "Команда", kk: "Команда", en: "Team" },
  staff: { ru: "Персонал", kk: "Қызметкерлер", en: "Staff" },
  rankings: { ru: "Рейтинг", kk: "Рейтинг", en: "Rankings" },
  partners: { ru: "Партнёры", kk: "Серіктестер", en: "Partners" },
  documents: { ru: "Документы", kk: "Құжаттар", en: "Documents" },
  gallery: { ru: "Галерея", kk: "Галерея", en: "Gallery" },
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (!session) {
    redirect("/auth/signin");
  }

  const stats = await getStats();
  const userRole = session.user?.role as string | undefined;
  const isContentManager = userRole === "Admin" || userRole === "Editor";

  const pageTitle = locale === "kk" ? "Басқару панелі" : locale === "en" ? "Control Panel" : "Панель управления";
  const regionLabel = locale === "kk" ? "Аймақ" : locale === "en" ? "Region" : "Регион";
  const roleLabel = locale === "kk" ? "Рөл" : locale === "en" ? "Role" : "Роль";
  const contentSectionTitle = locale === "kk" ? "Контент статистикасы" : locale === "en" ? "Content Statistics" : "Статистика контента";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {regionLabel}: <span className="font-medium text-foreground">{session.user?.name}</span>
          {userRole && (
            <>
              {" • "}
              {roleLabel}: <span className="font-medium text-foreground">{userRole}</span>
            </>
          )}
        </p>
      </div>

      {/* Content Statistics for Admin/Editor */}
      {isContentManager && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{contentSectionTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Link key={card.key} href={`/${locale}${card.href}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats[card.key as keyof typeof stats]}</p>
                      <p className="text-sm text-muted-foreground">
                        {labels[card.key]?.[locale] || labels[card.key]?.ru}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
