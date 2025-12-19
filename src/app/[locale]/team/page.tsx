import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/localization";

async function getTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return members;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
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

export default async function TeamPage() {
  const members = await getTeamMembers();
  const locale = await getLocale();

  const pageTitle = locale === 'kk' ? 'Ұлттық құрама' : locale === 'en' ? 'National Team' : 'Сборная Команда';

  if (members.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-8">{pageTitle}</h1>
        <p className="text-muted-foreground">No team members found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">{pageTitle}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((athlete) => (
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
    </div>
  );
}
