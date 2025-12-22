"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

interface Badge {
  id: string;
  logo: string;
  url: string;
  name: {
    ru: string;
    kk: string;
    en: string;
  };
}

const badges: Badge[] = [
  {
    id: 'world-archery',
    logo: '/badges/world-archery.svg',
    url: 'https://worldarchery.sport',
    name: {
      ru: 'Всемирная федерация стрельбы из лука',
      kk: 'Дүниежүзілік садақ ату федерациясы',
      en: 'World Archery Federation',
    },
  },
  {
    id: 'asian-archery',
    logo: '/badges/asian-archery.svg',
    url: 'https://archery.sport',
    name: {
      ru: 'Азиатская федерация стрельбы из лука',
      kk: 'Азия садақ ату федерациясы',
      en: 'Asian Archery Federation',
    },
  },
  {
    id: 'ministry',
    logo: '/badges/ministry.svg',
    url: 'https://gov.kz/memleket/entities/mts',
    name: {
      ru: 'Министерство туризма и спорта РК',
      kk: 'ҚР Туризм және спорт министрлігі',
      en: 'Ministry of Tourism and Sports of RK',
    },
  },
  {
    id: 'noc',
    logo: '/badges/noc.svg',
    url: 'https://olympic.kz',
    name: {
      ru: 'Национальный олимпийский комитет',
      kk: 'Ұлттық Олимпиада комитеті',
      en: 'National Olympic Committee',
    },
  },
];

export function OfficialBadges() {
  const locale = useLocale();

  const getTitle = () => {
    if (locale === 'kk') return 'Ресми серіктестер';
    if (locale === 'en') return 'Official Affiliations';
    return 'Официальные аффилиации';
  };

  return (
    <section className="py-12 bg-white border-t border-[hsl(var(--border-light))]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-heading font-semibold text-[hsl(var(--official-maroon))] text-center mb-8 gold-accent mx-auto w-fit">
          {getTitle()}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mt-10">
          {badges.map((badge) => (
            <a
              key={badge.id}
              href={badge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
              title={badge.name[locale as keyof typeof badge.name]}
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 grayscale-hover">
                <Image
                  src={badge.logo}
                  alt={badge.name[locale as keyof typeof badge.name]}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-center text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--official-maroon))] transition-colors max-w-[120px] leading-tight">
                {badge.name[locale as keyof typeof badge.name]}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
