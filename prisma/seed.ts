import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const REGIONS = [
  "Astana", "Almaty", "Shymkent",
  "Abai", "Akmola", "Aktobe", "Almaty Region", "Atyrau",
  "West Kazakhstan", "Zhambyl", "Zhetisu", "Karaganda",
  "Kostanay", "Kyzylorda", "Mangystau", "Pavlodar",
  "North Kazakhstan", "Turkistan", "Ulytau", "East Kazakhstan"
];

// News data from NewsBlock.tsx
const NEWS_DATA = [
  {
    slug: "kazakh-archers-3-gold-asian-cup",
    title: "Казахстанские лучники завоевали 3 золота на Кубке Азии",
    titleKk: "Қазақстандық садақшылар Азия кубогында 3 алтын алды",
    titleEn: "Kazakh archers win 3 gold medals at Asian Cup",
    content: "Национальная сборная Казахстана по стрельбе из лука показала отличные результаты на Кубке Азии, завоевав три золотые медали в различных дисциплинах. Это значительный успех для казахстанского лучного спорта.",
    contentKk: "Қазақстан Республикасының садақ атудан ұлттық құрамасы Азия кубогында тамаша нәтижелер көрсетіп, әртүрлі пәндерде үш алтын медаль жеңіп алды.",
    contentEn: "The national archery team of Kazakhstan showed excellent results at the Asian Cup, winning three gold medals in various disciplines.",
    excerpt: "Национальная сборная показала отличные результаты на международных соревнованиях.",
    category: "Сборная",
    image: "/slides/archer_tokyo.png",
    isMain: true,
    isPublished: true,
  },
  {
    slug: "registration-open-indoor-championship",
    title: "Открыта регистрация на Чемпионат РК в закрытых помещениях",
    titleKk: "Жабық үй-жайларда өтетін ҚР чемпионатына тіркеу ашылды",
    titleEn: "Registration open for Indoor Championship of Kazakhstan",
    content: "Федерация стрельбы из лука объявляет об открытии регистрации на Чемпионат Республики Казахстан в закрытых помещениях.",
    contentKk: "Садақ ату федерациясы Қазақстан Республикасының жабық үй-жайлардағы чемпионатына тіркеудің ашылғанын хабарлайды.",
    contentEn: "The Archery Federation announces the opening of registration for the Indoor Championship of the Republic of Kazakhstan.",
    category: "Регионы",
    image: "/slides/slide3.jpg",
    isMain: false,
    isPublished: true,
  },
  {
    slug: "world-archery-olympic-qualification",
    title: "World Archery обновил правила квалификации на Олимпиаду",
    titleKk: "World Archery Олимпиадаға іріктеу ережелерін жаңартты",
    titleEn: "World Archery updates Olympic qualification rules",
    content: "Международная федерация стрельбы из лука (World Archery) объявила об изменениях в правилах квалификации на Олимпийские игры.",
    contentKk: "Халықаралық садақ ату федерациясы (World Archery) Олимпиада ойындарына іріктеу ережелеріндегі өзгерістер туралы хабарлады.",
    contentEn: "The World Archery Federation has announced changes to the qualification rules for the Olympic Games.",
    category: "World Archery",
    image: "/slides/slide2.jpg",
    isMain: false,
    isPublished: true,
  },
  {
    slug: "independence-day-congratulations",
    title: "Поздравляем с Днём Независимости Республики Казахстан!",
    titleKk: "Қазақстан Республикасының Тәуелсіздік күнімен құттықтаймыз!",
    titleEn: "Congratulations on the Independence Day of the Republic of Kazakhstan!",
    content: "Федерация стрельбы из лука поздравляет всех казахстанцев с Днём Независимости!",
    contentKk: "Садақ ату федерациясы барлық қазақстандықтарды Тәуелсіздік күнімен құттықтайды!",
    contentEn: "The Archery Federation congratulates all Kazakhstanis on Independence Day!",
    category: "Праздники",
    image: "/slides/archer_tokyo.png",
    isMain: false,
    isPublished: true,
  },
];

// Slides data from HeroNewsSlider.tsx
const SLIDES_DATA = [
  {
    title: "День Независимости Республики Казахстан",
    titleKk: "Қазақстан Республикасының Тәуелсіздік күні",
    titleEn: "Independence Day of the Republic of Kazakhstan",
    description: "Поздравляем всех жителей страны с Днём Независимости! Пусть процветает наш Казахстан!",
    descriptionKk: "Барша елді Тәуелсіздік күнімен құттықтаймыз! Қазақстанымыз гүлденсін!",
    descriptionEn: "Congratulations to all citizens on Independence Day! May our Kazakhstan prosper!",
    image: "/slides/independence_new.jpg",
    imageClass: "object-contain bg-black",
    sortOrder: 0,
    isActive: true,
  },
  {
    title: "Республиканский турнир по Садақ Ату",
    titleKk: "Садақ атудан республикалық турнир",
    titleEn: "Republican Tournament on Traditional Archery",
    description: "В столице прошел масштабный чемпионат среди лучших лучников страны.",
    descriptionKk: "Астанада елдің үздік садақшылары арасында ауқымды чемпионат өтті.",
    descriptionEn: "A large-scale championship among the best archers of the country was held in the capital.",
    image: "/slides/archer_tokyo.png",
    sortOrder: 1,
    isActive: true,
  },
  {
    title: "Мастер-класс для молодежи",
    titleKk: "Жастарға арналған шеберлік сыныбы",
    titleEn: "Master class for youth",
    description: "Национальные традиции предков: опытные тренеры провели открытый урок по стрельбе из традиционного лука.",
    descriptionKk: "Ата-бабаларымыздың ұлттық дәстүрлері: тәжірибелі жаттықтырушылар дәстүрлі садақтан ату бойынша ашық сабақ өткізді.",
    descriptionEn: "National traditions of ancestors: experienced coaches conducted an open lesson on traditional archery.",
    image: "/slides/archer_tokyo.png",
    sortOrder: 2,
    isActive: true,
  },
  {
    title: "Новые правила соревнований",
    titleKk: "Жарыстардың жаңа ережелері",
    titleEn: "New competition rules",
    description: "Федерация утвердила обновленный регламент проведения международных встреч.",
    descriptionKk: "Федерация халықаралық кездесулерді өткізудің жаңартылған регламентін бекітті.",
    descriptionEn: "The Federation approved an updated regulation for international meetings.",
    image: "/slides/archer_tokyo.png",
    sortOrder: 3,
    isActive: true,
  },
];

// Team members data from team/page.tsx and ranking/page.tsx
const TEAM_MEMBERS_DATA = [
  {
    slug: "ilfat-abdullin",
    name: "Ильфат Абдуллин",
    nameKk: "Ильфат Абдуллин",
    nameEn: "Ilfat Abdullin",
    type: "Recurve",
    gender: "M",
    category: "Adults",
    region: "almaty_reg",
    coachName: "Константин Ким",
    coachNameKk: "Константин Ким",
    coachNameEn: "Konstantin Kim",
    image: "https://i.pravatar.cc/150?u=ilfat",
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "andrey-tyutyun",
    name: "Андрей Тютюн",
    nameKk: "Андрей Тютюн",
    nameEn: "Andrey Tyutyun",
    type: "Compound",
    gender: "M",
    category: "Adults",
    region: "almaty_reg",
    coachName: "Константин Ким",
    image: "https://i.pravatar.cc/150?u=andrey",
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "alina-ilyasova",
    name: "Алина Ильясова",
    nameKk: "Алина Ильясова",
    nameEn: "Alina Ilyasova",
    type: "Recurve",
    gender: "F",
    category: "Adults",
    region: "west_kaz",
    coachName: "Константин Ким",
    image: "https://i.pravatar.cc/150?u=alina",
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "akbarali-karabaev",
    name: "Акбарали Карабаев",
    nameKk: "Ақбарәлі Қарабаев",
    nameEn: "Akbarali Karabaev",
    type: "Compound",
    gender: "M",
    category: "Adults",
    region: "shymkent",
    coachName: "Константин Ким",
    image: "https://i.pravatar.cc/150?u=akbar",
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: "dauletkelddi-zhanbyrbay",
    name: "Даулеткельди Жанбырбай",
    nameKk: "Дәулеткелді Жанбырбай",
    nameEn: "Dauletkelddi Zhanbyrbay",
    type: "Recurve",
    gender: "M",
    category: "Adults",
    region: "shymkent",
    coachName: "Константин Ким",
    image: "https://i.pravatar.cc/150?u=daulet",
    isActive: true,
    sortOrder: 5,
  },
  {
    slug: "sanzhar-musaev",
    name: "Санжар Мусаев",
    nameKk: "Санжар Мұсаев",
    nameEn: "Sanzhar Musaev",
    type: "Recurve",
    gender: "M",
    category: "Adults",
    region: "astana",
    coachName: "Константин Ким",
    image: null,
    isActive: true,
    sortOrder: 6,
  },
];

// Rankings data from ranking/page.tsx
const RANKINGS_DATA = [
  { teamMemberSlug: "ilfat-abdullin", points: 850, rank: 1, previousRank: 1, classification: "International", season: "2025" },
  { teamMemberSlug: "andrey-tyutyun", points: 920, rank: 1, previousRank: 1, classification: "International", season: "2025" },
  { teamMemberSlug: "alina-ilyasova", points: 620, rank: 1, previousRank: 4, classification: "National", season: "2025" },
  { teamMemberSlug: "akbarali-karabaev", points: 880, rank: 2, previousRank: 2, classification: "National", season: "2025" },
  { teamMemberSlug: "dauletkelddi-zhanbyrbay", points: 780, rank: 2, previousRank: 3, classification: "National", season: "2025" },
  { teamMemberSlug: "sanzhar-musaev", points: 765, rank: 3, previousRank: 2, classification: "International", season: "2025" },
];

// Partners data from PartnersBlock.tsx
const PARTNERS_DATA = [
  {
    name: "SPORT QORY",
    websiteUrl: "https://sportqory.kz",
    instagramUrl: "https://instagram.com/sportqory",
    facebookUrl: "https://facebook.com/sportqory",
    sortOrder: 1,
    isActive: true,
  },
];

async function main() {
  console.log('Starting database seed...');

  // 1. Create Admin and Editor users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const editorPasswordHash = await bcrypt.hash('editor123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      role: 'Admin',
    },
  });
  console.log('Created admin user (password: admin123)');

  await prisma.user.upsert({
    where: { username: 'editor' },
    update: {},
    create: {
      username: 'editor',
      password: editorPasswordHash,
      role: 'Editor',
    },
  });
  console.log('Created editor user (password: editor123)');

  // 2. Create Regional Users
  const regionalPasswordHash = await bcrypt.hash('123456', 10);
  for (const region of REGIONS) {
    await prisma.user.upsert({
      where: { username: region },
      update: {},
      create: {
        username: region,
        password: regionalPasswordHash,
        role: 'RegionalRepresentative',
      },
    });
  }
  console.log(`Created ${REGIONS.length} regional users`);

  // 3. Create Tournament
  await prisma.tournament.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Чемпионат Республики Казахстан 2025",
      titleKk: "Қазақстан Республикасының Чемпионаты 2025",
      titleEn: "Championship of the Republic of Kazakhstan 2025",
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-02-20'),
      location: "Алматы",
      locationKk: "Алматы",
      locationEn: "Almaty",
      isActive: true,
    },
  });
  console.log('Created tournament');

  // 4. Seed News
  for (const newsItem of NEWS_DATA) {
    await prisma.news.upsert({
      where: { slug: newsItem.slug },
      update: newsItem,
      create: newsItem,
    });
  }
  console.log(`Created ${NEWS_DATA.length} news items`);

  // 5. Seed Slides
  for (let i = 0; i < SLIDES_DATA.length; i++) {
    await prisma.slide.upsert({
      where: { id: i + 1 },
      update: SLIDES_DATA[i],
      create: SLIDES_DATA[i],
    });
  }
  console.log(`Created ${SLIDES_DATA.length} slides`);

  // 6. Seed Team Members
  for (const member of TEAM_MEMBERS_DATA) {
    await prisma.teamMember.upsert({
      where: { slug: member.slug },
      update: member,
      create: member,
    });
  }
  console.log(`Created ${TEAM_MEMBERS_DATA.length} team members`);

  // 7. Seed Rankings
  for (const ranking of RANKINGS_DATA) {
    const member = await prisma.teamMember.findUnique({
      where: { slug: ranking.teamMemberSlug },
    });
    if (member) {
      await prisma.rankingEntry.upsert({
        where: {
          teamMemberId_season: {
            teamMemberId: member.id,
            season: ranking.season,
          },
        },
        update: {
          points: ranking.points,
          rank: ranking.rank,
          previousRank: ranking.previousRank,
          classification: ranking.classification,
        },
        create: {
          teamMemberId: member.id,
          points: ranking.points,
          rank: ranking.rank,
          previousRank: ranking.previousRank,
          classification: ranking.classification,
          season: ranking.season,
        },
      });
    }
  }
  console.log(`Created ${RANKINGS_DATA.length} ranking entries`);

  // 8. Seed Partners
  for (let i = 0; i < PARTNERS_DATA.length; i++) {
    await prisma.partner.upsert({
      where: { id: i + 1 },
      update: PARTNERS_DATA[i],
      create: PARTNERS_DATA[i],
    });
  }
  console.log(`Created ${PARTNERS_DATA.length} partners`);

  console.log('\nSeed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  Editor: editor / editor123');
  console.log('  Regional: [RegionName] / 123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
