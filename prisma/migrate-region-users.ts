import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Миграционный скрипт для привязки существующих пользователей к регионам.
 *
 * Проблема: Региональные пользователи были созданы без regionId,
 * поэтому они не отображаются в админ-панели как "Учётные записи региона".
 *
 * Запуск: npx ts-node prisma/migrate-region-users.ts
 */
async function main() {
  console.log('Starting region-user migration...\n');

  // Получить все регионы
  const regions = await prisma.region.findMany();
  console.log(`Found ${regions.length} regions\n`);

  let linkedCount = 0;
  let notFoundCount = 0;

  for (const region of regions) {
    // Извлечь имя города из названия региона
    // "Филиал г. Астана" -> "Астана"
    // "Филиал г. Алматы" -> "Алматы"
    let cityName = region.name
      .replace('Филиал ', '')
      .replace('г. ', '')
      .trim();

    // Также попробовать английские варианты
    const cityNameEn = region.nameEn?.replace(' Branch', '').trim();

    console.log(`Processing region: "${region.name}" (id=${region.id})`);
    console.log(`  Looking for user with username matching: "${cityName}" or "${cityNameEn}"`);

    // Нормализовать английское имя для поиска (убрать "Region")
    const cityNameEnNormalized = cityNameEn?.replace(' Region', '').trim();

    // Найти пользователя по имени региона
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cityName },
          { username: cityNameEn || '' },
          { username: cityNameEnNormalized || '' },
          { username: { contains: cityName, mode: 'insensitive' } },
          { username: { contains: cityNameEn || '', mode: 'insensitive' } },
          { username: { contains: cityNameEnNormalized || '', mode: 'insensitive' } },
        ],
        role: 'RegionalRepresentative',
        regionId: null, // Только пользователи без привязки
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          regionId: region.id,
          region: region.name
        },
      });
      console.log(`  ✓ Linked user "${user.username}" to region "${region.name}"\n`);
      linkedCount++;
    } else {
      console.log(`  ✗ No matching user found for region "${region.name}"\n`);
      notFoundCount++;
    }
  }

  console.log('Migration completed!');
  console.log(`  Linked: ${linkedCount}`);
  console.log(`  Not found: ${notFoundCount}`);

  // Показать текущее состояние
  console.log('\nCurrent region-user associations:');
  const regionsWithUsers = await prisma.region.findMany({
    include: {
      users: {
        select: { id: true, username: true, role: true }
      }
    }
  });

  for (const region of regionsWithUsers) {
    console.log(`  ${region.name}: ${region.users.length} user(s)`);
    for (const user of region.users) {
      console.log(`    - ${user.username} (${user.role})`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
