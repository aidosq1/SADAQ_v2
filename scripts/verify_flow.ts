
import { PrismaClient, RegistrationStatus, TournamentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting Backend Verification Flow...")

    // 1. Setup & Checks
    const tournament = await prisma.tournament.findFirst({
        where: { title: { contains: 'ЧЕМПИОНАТ КАЗАХСТАНА 2025' } },
        include: { categories: true }
    })

    if (!tournament) {
        throw new Error("Tournament not found! Did you run fix_dates.ts?")
    }
    console.log(`[PASS] Found Tournament: ${tournament.title}`)
    console.log(`       Status: ${tournament.status}`)
    console.log(`       Reg Deadline: ${tournament.registrationDeadline?.toISOString()}`)

    // Ensure OPEN
    if (tournament.status !== 'REGISTRATION_OPEN') {
        throw new Error(`Tournament status is ${tournament.status}, expected REGISTRATION_OPEN`)
    }

    const category = tournament.categories[0]
    if (!category) throw new Error("No categories found in tournament")
    console.log(`[PASS] Found Category: ${category.gender} ${category.type} - ${category.category}`)

    // Find or Create Athlete
    let athlete = await prisma.athlete.findFirst({
        where: { name: { contains: 'Petrov Test' } }
    })

    if (!athlete) {
        athlete = await prisma.athlete.create({
            data: {
                slug: `petrov-unique-test-${Date.now()}`,
                name: 'Petrov Test',
                gender: category.gender,
                type: category.type,
                category: category.category,
                region: 'Almaty',
                isActive: true,
                iin: '040515500123'
            }
        })
        console.log(`[ACTION] Created Test Athlete: ${athlete.name}`)
    } else {
        console.log(`[PASS] Found Test Athlete: ${athlete.name}`)
    }

    // Find User
    const user = await prisma.user.findFirst({ where: { username: 'Almaty' } })
    if (!user) throw new Error("User 'Almaty' not found")
    console.log(`[PASS] Found User: ${user.username}`)

    // 2. Test Registration
    console.log("\n--- Test 2: Registration ---")
    // Check if already registered
    const existingReg = await prisma.athleteRegistration.findFirst({
        where: {
            athleteId: athlete.id,
            registration: {
                tournamentCategoryId: category.id
            }
        }
    })

    let regId: number
    if (existingReg) {
        console.log(`[INFO] Athlete already registered via RegID ${existingReg.registrationId}`)
        regId = existingReg.registrationId
    } else {
        const reg = await prisma.registration.create({
            data: {
                userId: user.id,
                tournamentCategoryId: category.id,
                regionName: 'Almaty',
                status: RegistrationStatus.PENDING,
                registrationNumber: `REG-${Date.now()}`,
                athleteRegistrations: {
                    create: {
                        athleteId: athlete.id
                    }
                }
            }
        })
        console.log(`[SUCCESS] Registration Created: ${reg.registrationNumber}`)
        regId = reg.id
    }

    // 3. Test Approval
    console.log("\n--- Test 3: Approval ---")
    const approved = await prisma.registration.update({
        where: { id: regId },
        data: {
            status: RegistrationStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: 'admin'
        }
    })
    if (approved.status === 'APPROVED') {
        console.log(`[SUCCESS] Registration Approved by Admin`)
    } else {
        throw new Error("Failed to approve registration")
    }

    // 4. Test Result
    console.log("\n--- Test 4: Check Results ---")
    // Clean up old result if exists
    await prisma.tournamentResult.deleteMany({
        where: {
            tournamentCategoryId: category.id,
            athleteId: athlete.id
        }
    })

    const result = await prisma.tournamentResult.create({
        data: {
            tournamentCategoryId: category.id,
            athleteId: athlete.id,
            place: 1,
            points: 100,
            score: 650
        }
    })
    console.log(`[SUCCESS] Result Added: Place ${result.place}, Points ${result.points}`)

    console.log("\n*** ALL BACKEND VERIFICATION TESTS PASSED ***")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
