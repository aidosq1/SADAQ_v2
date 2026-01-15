// Script to update federation data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating federation data...');

  // 1. Update footer contacts
  console.log('Updating footer contacts...');

  await prisma.siteContent.upsert({
    where: { key: 'footer_phone' },
    update: { value: '87056639955' },
    create: { key: 'footer_phone', section: 'footer', value: '87056639955' }
  });
  console.log('Updated footer_phone to 87056639955');

  await prisma.siteContent.upsert({
    where: { key: 'footer_email' },
    update: { value: 'archery.kaz@gmail.com' },
    create: { key: 'footer_email', section: 'footer', value: 'archery.kaz@gmail.com' }
  });
  console.log('Updated footer_email to archery.kaz@gmail.com');

  // 2. Update Astana region director title to "Президент"
  console.log('Updating Astana director title...');

  const astanaRegion = await prisma.region.findFirst({
    where: {
      OR: [
        { name: { contains: 'Астана' } },
        { name: { contains: 'астана' } },
        { name: 'г. Астана' }
      ]
    }
  });

  if (astanaRegion) {
    await prisma.region.update({
      where: { id: astanaRegion.id },
      data: {
        directorTitle: 'Президент',
        directorTitleKk: 'Президент',
        directorTitleEn: 'President'
      }
    });
    console.log(`Updated Astana (id: ${astanaRegion.id}) director title to "Президент"`);
  } else {
    console.log('Warning: Astana region not found in database');
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
