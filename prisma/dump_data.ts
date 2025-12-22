import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const dataDir = path.join(__dirname, 'seeds', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('Dumping data to', dataDir);

    // Helper to dump a model
    const dump = async (modelName: string, delegate: any) => {
        try {
            console.log(`Dumping ${modelName}...`);
            const data = await delegate.findMany();
            fs.writeFileSync(
                path.join(dataDir, `${modelName}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`Saved ${data.length} records for ${modelName}`);
        } catch (e: any) {
            if (e.code === 'P2021') {
                console.warn(`Table for ${modelName} does not exist. Skipping.`);
                fs.writeFileSync(
                    path.join(dataDir, `${modelName}.json`),
                    JSON.stringify([], null, 2)
                );
            } else {
                console.error(`Error dumping ${modelName}:`, e);
                throw e;
            }
        }
    };

    // Models in dependency order (roughly)
    await dump('Region', prisma.region);
    await dump('User', prisma.user);
    await dump('Tournament', prisma.tournament);
    await dump('TournamentCategory', prisma.tournamentCategory);

    await dump('Athlete', prisma.athlete);
    await dump('Coach', prisma.coach);
    await dump('Judge', prisma.judge);

    await dump('NationalTeamMembership', prisma.nationalTeamMembership);
    await dump('AthleteCoach', prisma.athleteCoach); // Join table

    await dump('Registration', prisma.registration);
    await dump('AthleteRegistration', prisma.athleteRegistration); // Join table
    await dump('RegistrationJudge', prisma.registrationJudge); // Join table

    await dump('TournamentResult', prisma.tournamentResult);
    await dump('Protocol', prisma.protocol);

    await dump('News', prisma.news);

    await dump('Gallery', prisma.gallery);
    await dump('GalleryImage', prisma.galleryImage);

    await dump('Document', prisma.document);
    await dump('HistoryEvent', prisma.historyEvent);
    await dump('Partner', prisma.partner);
    await dump('SiteContent', prisma.siteContent);
    await dump('SiteStat', prisma.siteStat);
    await dump('Staff', prisma.staff);
    await dump('Translation', prisma.translation);

    console.log('Dump complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
