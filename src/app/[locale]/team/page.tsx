import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/localization";
import TeamFilters from "./TeamFilters";

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

function getLocalizedType(type: string, locale: string): string {
  const typeMap: Record<string, Record<string, string>> = {
    Recurve: { ru: 'Классический лук', kk: 'Классикалық садақ', en: 'Recurve' },
    Compound: { ru: 'Блочный лук', kk: 'Блоктық садақ', en: 'Compound' },
  };
  return typeMap[type]?.[locale] || type;
}

function getLocalizedCategory(category: string, locale: string): string {
  const categoryMap: Record<string, Record<string, string>> = {
    Adults: { ru: 'Взрослые', kk: 'Ересектер', en: 'Adults' },
    Youth: { ru: 'Молодёжь', kk: 'Жастар', en: 'Youth' },
    Juniors: { ru: 'Юниоры', kk: 'Юниорлар', en: 'Juniors' },
    Cadets: { ru: 'Кадеты', kk: 'Кадеттер', en: 'Cadets' },
    Cubs: { ru: 'Юноши', kk: 'Жасөспірімдер', en: 'Cubs' },
  };
  return categoryMap[category]?.[locale] || category;
}

export default async function TeamPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'Adults';
  const gender = params.gender || 'M';
  const type = params.type || 'Recurve';

  const athletes = await getAthletes(category, gender, type);
  const locale = await getLocale();

  const pageTitle = locale === 'kk' ? 'Ұлттық құрама' : locale === 'en' ? 'National Team' : 'Сборная Команда';
  const genderLabel = gender === 'M'
    ? (locale === 'kk' ? 'Ерлер' : locale === 'en' ? 'Men' : 'Мужчины')
    : (locale === 'kk' ? 'Әйелдер' : locale === 'en' ? 'Women' : 'Женщины');
  const subTitle = `${getLocalizedCategory(category, locale)} • ${genderLabel} • ${getLocalizedType(type, locale)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">{pageTitle}</h1>
      <p className="text-muted-foreground mb-6">{subTitle}</p>

      <TeamFilters
        currentCategory={category}
        currentGender={gender}
        currentType={type}
        locale={locale}
      />

      {athletes.length === 0 ? (
        <p className="text-muted-foreground mt-8">
          {locale === 'kk' ? 'Спортшылар табылмады' : locale === 'en' ? 'No athletes found' : 'Спортсмены не найдены'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {athletes.map((athlete) => (
            <Link key={athlete.id} href={`/team/${athlete.slug}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={athlete.image || undefined} alt={getLocalizedField(athlete, 'name', locale)} />
                    <AvatarFallback>{athlete.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-center">{getLocalizedField(athlete, 'name', locale)}</h3>
                  <p className="text-sm text-muted-foreground">{getLocalizedType(athlete.type, locale)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
