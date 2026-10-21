import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { cardInteractive } from "@/components/ui/card";
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
  { key: "news", icon: Newspaper, href: "/admin/news" },
  { key: "team", icon: Users, href: "/admin/team" },
  // Персонал редактируется на вкладке «Руководство» страницы контента
  { key: "staff", icon: UserCog, href: "/admin/content" },
  { key: "rankings", icon: Trophy, href: "/admin/rankings" },
  { key: "partners", icon: Handshake, href: "/admin/partners" },
  { key: "documents", icon: FileText, href: "/admin/documents" },
  { key: "gallery", icon: Images, href: "/admin/gallery" },
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
    <div>
      <PageHeader
        title={pageTitle}
        actions={
          <p className="type-small text-muted-foreground">
            {regionLabel}: <span className="font-medium text-foreground">{session.user?.name}</span>
            {userRole && (
              <>
                {" · "}
                {roleLabel}: <span className="font-medium text-foreground">{userRole}</span>
              </>
            )}
          </p>
        }
      />

      {isContentManager && (
        <section>
          <h2 className="type-h3 mb-4 text-foreground">{contentSectionTitle}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {statCards.map((card) => (
              <Link key={card.key} href={`/${locale}${card.href}`} className="rounded-lg">
                <MetricCard
                  icon={card.icon}
                  value={stats[card.key as keyof typeof stats]}
                  label={labels[card.key]?.[locale] || labels[card.key]?.ru}
                  className={cardInteractive}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
