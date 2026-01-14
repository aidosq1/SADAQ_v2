import { PrismaClient } from '@prisma/client';
import { revalidateTag } from 'next/cache';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing translations...\n');

  const translations = [
    // ResultsPage translations
    {
      namespace: 'ResultsPage',
      key: 'title',
      ru: 'Протоколы соревнований',
      kk: 'Жарыс хаттамалары',
      en: 'Competition Protocols',
    },
    {
      namespace: 'ResultsPage',
      key: 'season',
      ru: 'Сезон',
      kk: 'Маусым',
      en: 'Season',
    },
    {
      namespace: 'ResultsPage',
      key: 'btn_protocol',
      ru: 'Протокол',
      kk: 'Хаттама',
      en: 'Protocol',
    },
    {
      namespace: 'ResultsPage',
      key: 'no_protocols',
      ru: 'Нет доступных протоколов',
      kk: 'Қол жетімді хаттамалар жоқ',
      en: 'No protocols available',
    },
    // Header translations
    {
      namespace: 'Header',
      key: 'tournaments',
      ru: 'Турниры',
      kk: 'Турнирлер',
      en: 'Tournaments',
    },
    {
      namespace: 'Header',
      key: 'protocols',
      ru: 'Протоколы',
      kk: 'Хаттамалар',
      en: 'Protocols',
    },
  ];

  let updated = false;

  for (const trans of translations) {
    const existing = await prisma.translation.findUnique({
      where: {
        namespace_key: {
          namespace: trans.namespace,
          key: trans.key,
        },
      },
    });

    if (!existing) {
      await prisma.translation.create({
        data: trans,
      });
      console.log(`✓ Added ${trans.namespace}.${trans.key} = "${trans.ru}"`);
      updated = true;
    } else {
      console.log(`- ${trans.namespace}.${trans.key} already exists`);
    }
  }

  if (updated) {
    console.log('\n🔄 Invalidating translations cache...');
    try {
      revalidateTag('translations');
      console.log('✓ Cache invalidated');
    } catch (e) {
      console.log('⚠ Could not invalidate cache automatically');
      console.log('Please restart your dev server: npm run dev');
    }
  }

  console.log('\n✅ All translations added successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart dev server: npm run dev');
  console.log('   2. Or refresh the page in browser');
}

main()
  .catch((e) => {
    console.error('❌ Error adding translations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
