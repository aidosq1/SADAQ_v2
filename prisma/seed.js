
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const REGIONS = [
    "Astana", "Almaty", "Shymkent",
    "Abai", "Akmola", "Aktobe", "Almaty Region", "Atyrau",
    "West Kazakhstan", "Zhambyl", "Zhetisu", "Karaganda",
    "Kostanay", "Kyzylorda", "Mangystau", "Pavlodar",
    "North Kazakhstan", "Turkistan", "Ulytau", "East Kazakhstan"
]

async function main() {
    console.log('Seeding database...')

    // 1. Create Default Tournament
    const tournament = await prisma.tournament.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: "Чемпионат Республики Казахстан 2025",
            startDate: new Date('2025-02-15'),
            endDate: new Date('2025-02-20'),
            location: "Алматы",
            isActive: true
        }
    })
    console.log({ tournament })

    // 2. Create Region Users
    const passwordHash = await bcrypt.hash('123456', 10) // Default password for all

    for (const region of REGIONS) {
        const user = await prisma.user.upsert({
            where: { username: region },
            update: {},
            create: {
                username: region,
                password: passwordHash,
                role: "RegionalRepresentative"
            }
        })
        console.log(`Created user: ${user.username}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
