import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type MessagesStructure = Record<string, Record<string, string>>;

async function migrateTranslations() {
  console.log('Starting translation migration...');

  // Read JSON files
  const messagesDir = path.join(__dirname, '..', 'messages');

  const ruMessages: MessagesStructure = JSON.parse(
    fs.readFileSync(path.join(messagesDir, 'ru.json'), 'utf-8')
  );
  const kkMessages: MessagesStructure = JSON.parse(
    fs.readFileSync(path.join(messagesDir, 'kk.json'), 'utf-8')
  );
  const enMessages: MessagesStructure = JSON.parse(
    fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8')
  );

  console.log(`Found ${Object.keys(ruMessages).length} namespaces in ru.json`);

  // Prepare translations data
  const translations: { namespace: string; key: string; ru: string; kk: string | null; en: string | null }[] = [];

  for (const namespace of Object.keys(ruMessages)) {
    const ruNamespace = ruMessages[namespace];
    const kkNamespace = kkMessages[namespace] || {};
    const enNamespace = enMessages[namespace] || {};

    for (const key of Object.keys(ruNamespace)) {
      translations.push({
        namespace,
        key,
        ru: ruNamespace[key],
        kk: kkNamespace[key] || null,
        en: enNamespace[key] || null,
      });
    }
  }

  console.log(`Prepared ${translations.length} translation entries`);

  // Clear existing translations
  await prisma.translation.deleteMany();
  console.log('Cleared existing translations');

  // Insert in batches
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < translations.length; i += batchSize) {
    const batch = translations.slice(i, i + batchSize);
    await prisma.translation.createMany({
      data: batch,
    });
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${translations.length} translations`);
  }

  console.log('Migration completed successfully!');

  // Print summary by namespace
  const summary = await prisma.translation.groupBy({
    by: ['namespace'],
    _count: true,
  });

  console.log('\nSummary by namespace:');
  for (const item of summary) {
    console.log(`  ${item.namespace}: ${item._count} keys`);
  }
}

migrateTranslations()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
