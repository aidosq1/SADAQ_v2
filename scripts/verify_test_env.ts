
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying test environment...');

  // Check for open tournament
  const tournament = await prisma.tournament.findFirst({
    where: { status: 'REGISTRATION_OPEN' },
    include: { categories: true }
  });

  if (tournament) {
    console.log(`[OK] Open Tournament found: "${tournament.title}" (ID: ${tournament.id})`);
    console.log(`     Categories: ${tournament.categories.length}`);
  } else {
    console.error('[FAIL] No tournament with status REGISTRATION_OPEN found.');
  }

  // Check counts
  const athletes = await prisma.athlete.count();
  console.log(`[${athletes > 0 ? 'OK' : 'WARN'}] Athletes count: ${athletes}`);

  const coaches = await prisma.coach.count();
  console.log(`[${coaches > 0 ? 'OK' : 'WARN'}] Coaches count: ${coaches}`);

  const judges = await prisma.judge.count();
  console.log(`[${judges > 0 ? 'OK' : 'WARN'}] Judges count: ${judges}`);

  // Check Users
  const repUser = await prisma.user.findFirst({
    where: { role: 'RegionalRepresentative' }
  });
  if (repUser) {
    console.log(`[OK] Regional Representative found: ${repUser.username}`);
  } else {
    console.error('[FAIL] No RegionalRepresentative user found.');
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'Admin', 'admin'] } }
  });
  if (adminUser) {
    console.log(`[OK] Admin user found: ${adminUser.username}`);
  } else {
    console.warn('[WARN] No explicitly named Admin user found (might be okay if role handling is different).');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
