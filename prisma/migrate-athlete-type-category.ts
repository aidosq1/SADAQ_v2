import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration of type/category from Athlete to NationalTeamMembership...');

  // Get all athletes with type and category
  const athletes = await prisma.$queryRaw<Array<{
    id: number;
    type: string | null;
    category: string | null;
    gender: string;
  }>>`SELECT id, type, category, gender FROM "Athlete" WHERE type IS NOT NULL AND category IS NOT NULL`;

  console.log(`Found ${athletes.length} athletes with type and category`);

  let created = 0;
  let skipped = 0;

  for (const athlete of athletes) {
    if (!athlete.type || !athlete.category) {
      skipped++;
      continue;
    }

    // Check if membership already exists
    const existing = await prisma.nationalTeamMembership.findFirst({
      where: {
        athleteId: athlete.id,
        category: athlete.category,
        gender: athlete.gender,
        type: athlete.type,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Create national team membership
    await prisma.nationalTeamMembership.create({
      data: {
        athleteId: athlete.id,
        category: athlete.category,
        gender: athlete.gender,
        type: athlete.type,
        isActive: true,
      },
    });
    created++;
  }

  console.log(`Migration complete: ${created} created, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
