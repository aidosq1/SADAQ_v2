import { Users } from "lucide-react";
import { Link } from "@/navigation";
import { cardInteractive, cardSurface } from "@/components/ui/card";
import Image from "next/image";
import { PersonPlaceholder } from "@/components/ui/person-placeholder";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/localization";
import TeamFilters from "./TeamFilters";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ category?: string; gender?: string; type?: string }>;
}

async function getAthletes(category: string, gender: string, type: string) {
  try {
    const memberships = await prisma.nationalTeamMembership.findMany({
      where: {
        category,
        gender,
        type,
        isActive: true,
        athlete: { isActive: true },
      },
      include: {
        athlete: true,
      },
      orderBy: { athlete: { sortOrder: 'asc' } },
    });
    return memberships.map(m => ({ ...m.athlete, type: m.type }));
  } catch (error) {
    return [];
  }
}

function getPageTitle(locale: string): string {
  return locale === 'kk' ? 'Ұлттық құрама' : locale === 'en' ? 'National Team' : 'Сборная команда';
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: getPageTitle(await getLocale()) };
}

export default async function TeamPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'Adults';
  const gender = params.gender || 'M';
  const type = params.type || 'Recurve';

  const athletes = await getAthletes(category, gender, type);
  const locale = await getLocale();

  const pageTitle = getPageTitle(locale);

  return (
    <PageContainer>
      <PageHeader title={pageTitle} />

      <TeamFilters
        currentCategory={category}
        currentGender={gender}
        currentType={type}
        locale={locale}
      />

      {athletes.length === 0 ? (
        <EmptyState
          icon={Users}
          className="mt-8"
          title={locale === 'kk' ? 'Спортшылар табылмады' : locale === 'en' ? 'No athletes found' : 'Спортсмены не найдены'}
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {athletes.map((athlete) => (
            <Link
              key={athlete.id}
              href={`/team/${athlete.slug}`}
              className={cn(cardSurface, cardInteractive, "group flex h-full flex-col overflow-hidden")}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                {athlete.image ? (
                  <Image
                    src={athlete.image}
                    alt={getLocalizedField(athlete, 'name', locale)}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PersonPlaceholder className="size-1/3" />
                  </div>
                )}
              </div>
              <h2 className="type-h4 line-clamp-2 p-4 text-foreground transition-colors group-hover:text-primary sm:p-5">
                {getLocalizedField(athlete, 'name', locale)}
              </h2>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
