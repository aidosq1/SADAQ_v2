// Seed script v2 - synced with database data
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, 'seeds', 'data');

  // Order matters for dependencies!
  // Parent tables first for creation, last for deletion.
  const models = [
    'Region',
    'User',
    'Tournament',
    'TournamentCategory',
    'Athlete',
    'Coach',
    'Judge',
    'NationalTeamMembership',
    'AthleteCoach',
    'Registration',
    'AthleteRegistration',
    'RegistrationJudge',
    'TournamentResult',
    'Protocol',
    'News',
    'Gallery',
    'GalleryImage',
    'GalleryItem',
    'Document',
    'HistoryEvent',
    'Partner',
    'SiteContent',
    'SiteStat',
    'Staff',
    'Translation'
  ];

  console.log('Starting seed...');

  // 1. Clean up existing data (Reverse order)
  console.log('Cleaning up existing data...');
  for (let i = models.length - 1; i >= 0; i--) {
    const modelName = models[i];
    try {
      // @ts-ignore
      await prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)].deleteMany();
      console.log(`Cleared ${modelName}`);
    } catch (e: any) {
      if (e.code === 'P2021') {
        console.warn(`Table for ${modelName} missing, skipping delete.`);
      } else {
        console.error(`Error clearing ${modelName}:`, e.message);
      }
    }
  }

  // 2. Insert data (Forward order)
  console.log('Inserting data...');
  for (const modelName of models) {
    const filePath = path.join(dataDir, `${modelName}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`No data file for ${modelName}, skipping.`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`No records to seed for ${modelName}.`);
      continue;
    }

    // @ts-ignore
    const delegate = prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];

    try {
      // Use createMany for performance
      await delegate.createMany({
        data: data,
        skipDuplicates: true,
      });
      console.log(`Seeded ${data.length} records for ${modelName}`);

      // 3. Reset sequence for Postgres (Optional but recommended)
      // Try to reset sequence if 'id' exists in the first record
      if (data[0].id !== undefined) {
        try {
          // Assuming default schema 'public' and table name matches model name (case sensitive usually in Prisma -> Postgres mapping)
          // Prisma default map: Model -> "Model"
          await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"public"."${modelName}"', 'id'), coalesce(max(id)+1, 1), false) FROM "public"."${modelName}";`);
        } catch (seqErr: any) {
          // Ignore error if not Postgres or sequence doesn't exist
          // console.log(`Sequence reset skipped for ${modelName}`);
        }
      }

    } catch (e: any) {
      console.error(`Error seeding ${modelName}:`, e.message);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
