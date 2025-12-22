
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding test users (Coaches & Judges)...');

    // 1. Create Coaches
    const coachesData = [
        { name: 'Ivanov Ivan', bio: 'Expert Coach', phone: '+77011111111' },
        { name: 'Petrov Petr', bio: 'Senior Coach', phone: '+77022222222' },
        { name: 'Sidorov Sid', bio: 'Assistant Coach', phone: '+77033333333' },
    ];

    for (const c of coachesData) {
        await prisma.coach.create({
            data: {
                name: c.name,
                bio: c.bio,
                phone: c.phone,
                isActive: true,
            }
        });
    }
    console.log(`Created ${coachesData.length} coaches`);

    // 2. Create Judges
    const judgesData = [
        { name: 'Judge Judy', category: 'International', phone: '+77055555555' },
        { name: 'Judge Dredd', category: 'National', phone: '+77066666666' },
        { name: 'Judge Dao', category: 'Regional', phone: '+77077777777' },
    ];

    for (const j of judgesData) {
        await prisma.judge.create({
            data: {
                name: j.name,
                category: j.category,
                phone: j.phone,
                isActive: true,
            }
        });
    }
    console.log(`Created ${judgesData.length} judges`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
