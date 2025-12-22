
import { PrismaClient, TournamentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tournamentTitle = 'ЧЕМПИОНАТ КАЗАХСТАНА 2025'
    console.log(`Searching for tournament: ${tournamentTitle}`)

    const tournament = await prisma.tournament.findFirst({
        where: {
            title: {
                contains: 'ЧЕМПИОНАТ КАЗАХСТАНА 2025'
            }
        }
    })

    if (!tournament) {
        console.error('Tournament not found!')
        process.exit(1)
    }

    console.log(`Found tournament: ${tournament.title} (ID: ${tournament.id})`)

    const updated = await prisma.tournament.update({
        where: { id: tournament.id },
        data: {
            status: TournamentStatus.REGISTRATION_OPEN,
            registrationDeadline: new Date('2026-02-01T18:00:00.000Z'),
            startDate: new Date('2026-03-01T09:00:00.000Z'),
            endDate: new Date('2026-03-10T18:00:00.000Z'),
            isActive: true,
            requiresVerification: true
        }
    })

    console.log('Tournament updated successfully!')
    console.log('New Data:', JSON.stringify(updated, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
