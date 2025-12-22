import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping from athlete.region string values to region names
const REGION_MAPPING: Record<string, { name: string; nameKk: string; nameEn: string }> = {
  'astana': { name: 'г. Астана', nameKk: 'Астана қ.', nameEn: 'Astana' },
  'almaty': { name: 'г. Алматы', nameKk: 'Алматы қ.', nameEn: 'Almaty' },
  'shymkent': { name: 'г. Шымкент', nameKk: 'Шымкент қ.', nameEn: 'Shymkent' },
  'almaty_reg': { name: 'Алматинская область', nameKk: 'Алматы облысы', nameEn: 'Almaty Region' },
  'west_kaz': { name: 'Западно-Казахстанская область', nameKk: 'Батыс Қазақстан облысы', nameEn: 'West Kazakhstan Region' },
  'zhetysu': { name: 'Жетысуская область', nameKk: 'Жетісу облысы', nameEn: 'Zhetysu Region' },
  'akmola': { name: 'Акмолинская область', nameKk: 'Ақмола облысы', nameEn: 'Akmola Region' },
  'karaganda': { name: 'Карагандинская область', nameKk: 'Қарағанды облысы', nameEn: 'Karaganda Region' },
  'turkistan': { name: 'Туркестанская область', nameKk: 'Түркістан облысы', nameEn: 'Turkestan Region' },
  'pavlodar': { name: 'Павлодарская область', nameKk: 'Павлодар облысы', nameEn: 'Pavlodar Region' },
  'atyrau': { name: 'Атырауская область', nameKk: 'Атырау облысы', nameEn: 'Atyrau Region' },
  'aktobe': { name: 'Актюбинская область', nameKk: 'Ақтөбе облысы', nameEn: 'Aktobe Region' },
  'kyzylorda': { name: 'Кызылординская область', nameKk: 'Қызылорда облысы', nameEn: 'Kyzylorda Region' },
  'mangystau': { name: 'Мангистауская область', nameKk: 'Маңғыстау облысы', nameEn: 'Mangystau Region' },
  'kostanay': { name: 'Костанайская область', nameKk: 'Қостанай облысы', nameEn: 'Kostanay Region' },
  'north_kaz': { name: 'Северо-Казахстанская область', nameKk: 'Солтүстік Қазақстан облысы', nameEn: 'North Kazakhstan Region' },
  'east_kaz': { name: 'Восточно-Казахстанская область', nameKk: 'Шығыс Қазақстан облысы', nameEn: 'East Kazakhstan Region' },
  'ulytau': { name: 'Улытауская область', nameKk: 'Ұлытау облысы', nameEn: 'Ulytau Region' },
  'abai': { name: 'Абайская область', nameKk: 'Абай облысы', nameEn: 'Abai Region' },
};

async function migrate() {
  console.log('Starting migration...\n');

  // Step 1: Delete all existing regions (they are duplicates with wrong names)
  console.log('Step 1: Cleaning up existing regions...');
  const deletedRegions = await prisma.region.deleteMany({});
  console.log(`Deleted ${deletedRegions.count} old region records.\n`);

  // Step 2: Create new regions based on the mapping
  console.log('Step 2: Creating new regions...');
  const regionIdMap: Record<string, number> = {};

  let sortOrder = 1;
  for (const [key, data] of Object.entries(REGION_MAPPING)) {
    const region = await prisma.region.create({
      data: {
        name: data.name,
        nameKk: data.nameKk,
        nameEn: data.nameEn,
        director: '',
        address: '',
        phone: '',
        sortOrder: sortOrder++,
        isActive: true,
      },
    });
    regionIdMap[key] = region.id;
    console.log(`Created region: ${data.name} (id: ${region.id})`);
  }
  console.log('');

  // Step 3: Update athletes with regionId based on their region string
  console.log('Step 3: Updating athletes with regionId...');

  for (const [regionKey, regionId] of Object.entries(regionIdMap)) {
    const updated = await prisma.athlete.updateMany({
      where: { region: regionKey },
      data: { regionId },
    });
    if (updated.count > 0) {
      console.log(`Updated ${updated.count} athletes with region "${regionKey}" -> regionId ${regionId}`);
    }
  }
  console.log('');

  // Step 4: Update coaches with regionId
  console.log('Step 4: Updating coaches...');

  // Map old "Филиал" names to new region IDs
  const coachRegionUpdates = [
    { oldRegionName: 'Астана', newKey: 'astana' },
    { oldRegionName: 'Алматы', newKey: 'almaty' },
    { oldRegionName: 'Шымкент', newKey: 'shymkent' },
  ];

  for (const { oldRegionName, newKey } of coachRegionUpdates) {
    const regionId = regionIdMap[newKey];
    if (regionId) {
      // Find coaches with old region IDs that match city name pattern
      const coaches = await prisma.coach.findMany({
        where: {
          region: {
            name: { contains: oldRegionName }
          }
        }
      });

      for (const coach of coaches) {
        await prisma.coach.update({
          where: { id: coach.id },
          data: { regionId },
        });
        console.log(`Updated coach ${coach.name} -> regionId ${regionId}`);
      }
    }
  }

  // For coaches without a region, try to set based on their old regionId
  const coachesWithOldRegion = await prisma.coach.findMany({
    where: { regionId: { not: null } },
    include: { region: true }
  });

  for (const coach of coachesWithOldRegion) {
    if (coach.region) {
      // Try to find matching new region
      let newRegionId: number | null = null;

      if (coach.region.name.includes('Астана')) {
        newRegionId = regionIdMap['astana'];
      } else if (coach.region.name.includes('Алматы')) {
        newRegionId = regionIdMap['almaty'];
      } else if (coach.region.name.includes('Шымкент')) {
        newRegionId = regionIdMap['shymkent'];
      }

      if (newRegionId && newRegionId !== coach.regionId) {
        await prisma.coach.update({
          where: { id: coach.id },
          data: { regionId: newRegionId }
        });
        console.log(`Updated coach ${coach.name} regionId from ${coach.regionId} to ${newRegionId}`);
      }
    }
  }

  console.log('\nMigration completed!');

  // Summary
  const athleteCount = await prisma.athlete.count({ where: { regionId: { not: null } } });
  const totalAthletes = await prisma.athlete.count();
  console.log(`\nSummary:`);
  console.log(`- Created ${Object.keys(regionIdMap).length} regions`);
  console.log(`- ${athleteCount}/${totalAthletes} athletes now have regionId`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
