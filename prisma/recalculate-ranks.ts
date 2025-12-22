import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateRanks() {
  console.log('Starting rank recalculation...');

  // Get all unique category/gender/type combinations
  const combinations = await prisma.rankingEntry.findMany({
    select: {
      category: true,
      gender: true,
      type: true,
    },
    distinct: ['category', 'gender', 'type'],
  });

  console.log(`Found ${combinations.length} category combinations`);

  for (const combo of combinations) {
    console.log(`\nProcessing: ${combo.category} ${combo.gender} ${combo.type}`);

    // Get all rankings for this combination, sorted by points descending
    const rankings = await prisma.rankingEntry.findMany({
      where: {
        category: combo.category,
        gender: combo.gender,
        type: combo.type,
      },
      orderBy: { points: 'desc' },
    });

    console.log(`  Found ${rankings.length} entries`);

    // Update ranks based on position (1, 2, 3, ...)
    for (let i = 0; i < rankings.length; i++) {
      const newRank = i + 1;
      if (rankings[i].rank !== newRank) {
        await prisma.rankingEntry.update({
          where: { id: rankings[i].id },
          data: { rank: newRank },
        });
        console.log(`  Updated ${rankings[i].id}: rank ${rankings[i].rank} -> ${newRank} (${rankings[i].points} pts)`);
      }
    }
  }

  console.log('\nRank recalculation complete!');
}

recalculateRanks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
