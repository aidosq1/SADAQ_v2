// Seed rankings, regions, and update athletes from ranking2026.ts data
import { PrismaClient } from '@prisma/client';
import { TEAM_MEMBERS_DATA_2026, RANKINGS_DATA_2026 } from './ranking2026';

const prisma = new PrismaClient();

// Region mapping: slug -> full names
const REGIONS_MAP: Record<string, { name: string; nameKk: string; nameEn: string }> = {
  'astana': { name: 'г. Астана', nameKk: 'Астана қ.', nameEn: 'Astana' },
  'almaty': { name: 'г. Алматы', nameKk: 'Алматы қ.', nameEn: 'Almaty' },
  'shymkent': { name: 'г. Шымкент', nameKk: 'Шымкент қ.', nameEn: 'Shymkent' },
  'akmola': { name: 'Акмолинская область', nameKk: 'Ақмола облысы', nameEn: 'Akmola Region' },
  'almaty_reg': { name: 'Алматинская область', nameKk: 'Алматы облысы', nameEn: 'Almaty Region' },
  'atyrau': { name: 'Атырауская область', nameKk: 'Атырау облысы', nameEn: 'Atyrau Region' },
  'west_kaz': { name: 'Западно-Казахстанская область', nameKk: 'Батыс Қазақстан облысы', nameEn: 'West Kazakhstan Region' },
  'zhetysu': { name: 'Жетысуская область', nameKk: 'Жетісу облысы', nameEn: 'Zhetysu Region' },
  'karaganda': { name: 'Карагандинская область', nameKk: 'Қарағанды облысы', nameEn: 'Karaganda Region' },
  'pavlodar': { name: 'Павлодарская область', nameKk: 'Павлодар облысы', nameEn: 'Pavlodar Region' },
  'turkistan': { name: 'Туркестанская область', nameKk: 'Түркістан облысы', nameEn: 'Turkistan Region' },
};


async function main() {
  console.log('=== Starting comprehensive seed ===\n');

  // Step 1: Create/update regions
  console.log('Step 1: Creating/updating regions...');
  const regionIdMap = new Map<string, number>();

  for (const [slug, data] of Object.entries(REGIONS_MAP)) {
    const region = await prisma.region.upsert({
      where: { id: regionIdMap.get(slug) || 0 },
      update: {
        name: data.name,
        nameKk: data.nameKk,
        nameEn: data.nameEn,
      },
      create: {
        name: data.name,
        nameKk: data.nameKk,
        nameEn: data.nameEn,
        director: 'Не указан',
        address: 'Не указан',
        phone: 'Не указан',
        sortOrder: Object.keys(REGIONS_MAP).indexOf(slug) + 1,
      },
    });
    regionIdMap.set(slug, region.id);
  }

  // Re-fetch all regions to get correct IDs
  const allRegions = await prisma.region.findMany();
  for (const region of allRegions) {
    // Find matching slug by name
    for (const [slug, data] of Object.entries(REGIONS_MAP)) {
      if (region.name === data.name) {
        regionIdMap.set(slug, region.id);
        break;
      }
    }
  }

  console.log(`Created/updated ${regionIdMap.size} regions`);

  // Step 2: Update athletes with regions
  console.log('\nStep 2: Updating athletes with regions...');
  let athletesUpdated = 0;

  for (const member of TEAM_MEMBERS_DATA_2026) {
    const regionId = regionIdMap.get(member.region);
    if (!regionId) {
      console.warn(`Region not found: ${member.region}`);
      continue;
    }

    try {
      await prisma.athlete.updateMany({
        where: { slug: member.slug },
        data: { regionId },
      });
      athletesUpdated++;
    } catch (e: any) {
      // Skip if athlete doesn't exist
    }
  }

  console.log(`Updated ${athletesUpdated} athletes with regions`);

  // Step 3: Create ranking entries
  console.log('\nStep 3: Creating ranking entries...');

  // Get all athletes
  const athletes = await prisma.athlete.findMany({
    select: { id: true, slug: true }
  });
  const athleteMap = new Map(athletes.map(a => [a.slug, a.id]));

  // Create member data map for type/gender/category
  const memberDataMap = new Map(TEAM_MEMBERS_DATA_2026.map(m => [m.slug, m]));

  let rankingsCreated = 0;
  let rankingsSkipped = 0;

  for (const ranking of RANKINGS_DATA_2026) {
    const athleteId = athleteMap.get(ranking.slug);
    const memberData = memberDataMap.get(ranking.slug);

    if (!athleteId || !memberData) {
      rankingsSkipped++;
      continue;
    }

    try {
      await prisma.rankingEntry.upsert({
        where: {
          athleteId_category_gender_type: {
            athleteId,
            category: memberData.category,
            gender: memberData.gender,
            type: memberData.type,
          }
        },
        update: {
          points: ranking.points,
          rank: ranking.rank,
        },
        create: {
          athleteId,
          category: memberData.category,
          gender: memberData.gender,
          type: memberData.type,
          points: ranking.points,
          rank: ranking.rank,
        }
      });
      rankingsCreated++;
    } catch (e: any) {
      console.error(`Error for ${ranking.slug}:`, e.message);
      rankingsSkipped++;
    }
  }

  console.log(`Created/updated ${rankingsCreated} ranking entries`);
  console.log(`Skipped ${rankingsSkipped} entries`);

  // Summary
  console.log('\n=== Seed completed! ===');
  console.log(`Regions: ${regionIdMap.size}`);
  console.log(`Athletes updated: ${athletesUpdated}`);
  console.log(`Rankings: ${rankingsCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
