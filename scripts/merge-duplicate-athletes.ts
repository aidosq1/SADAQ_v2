/**
 * Скрипт для объединения дубликатов атлетов
 *
 * Проблема: один человек создан как несколько Athlete с разными slug
 * Решение: объединить в одного Athlete с несколькими RankingEntry
 *
 * Запуск: npx ts-node scripts/merge-duplicate-athletes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Генерация простого slug из имени с полной транслитерацией
function generateSlug(name: string): string {
    const translitMap: Record<string, string> = {
        // Казахские
        'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o',
        'ұ': 'u', 'ү': 'u', 'һ': 'h', 'і': 'i',
        'Ә': 'A', 'Ғ': 'G', 'Қ': 'Q', 'Ң': 'N', 'Ө': 'O',
        'Ұ': 'U', 'Ү': 'U', 'Һ': 'H', 'І': 'I',
        // Русские
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
        'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
        'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
        'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
        'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
        'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '',
        'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    };

    return name
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function main() {
    console.log('=== Объединение дубликатов атлетов ===\n');

    // 1. Найти все дубликаты по имени
    const athletes = await prisma.athlete.findMany({
        include: {
            rankings: true,
            tournamentResults: true,
            nationalTeamMemberships: true,
            athleteRegistrations: true,
        },
        orderBy: { id: 'asc' }
    });

    // Группируем по имени
    const grouped: Record<string, typeof athletes> = {};
    for (const athlete of athletes) {
        if (!grouped[athlete.name]) {
            grouped[athlete.name] = [];
        }
        grouped[athlete.name].push(athlete);
    }

    // Фильтруем только дубликаты
    const duplicates = Object.entries(grouped).filter(([_, arr]) => arr.length > 1);

    console.log(`Найдено ${duplicates.length} групп дубликатов\n`);

    let mergedCount = 0;
    let deletedCount = 0;

    for (const [name, athleteGroup] of duplicates) {
        console.log(`\n--- ${name} (${athleteGroup.length} записей) ---`);

        // Главный атлет - первый по id
        const primary = athleteGroup[0];
        const others = athleteGroup.slice(1);

        console.log(`  Главный: id=${primary.id}, slug=${primary.slug}`);

        // Генерируем новый простой slug
        let newSlug = generateSlug(name);

        // Проверяем уникальность slug
        const existingSlug = await prisma.athlete.findFirst({
            where: {
                slug: newSlug,
                id: { not: primary.id }
            }
        });

        if (existingSlug) {
            newSlug = `${newSlug}-${primary.id}`;
        }

        // Обновляем slug главного атлета
        if (primary.slug !== newSlug) {
            await prisma.athlete.update({
                where: { id: primary.id },
                data: { slug: newSlug }
            });
            console.log(`  Новый slug: ${newSlug}`);
        }

        // Переносим данные с дубликатов на главного
        for (const dup of others) {
            console.log(`  Обрабатываем дубликат: id=${dup.id}`);

            // Переносим рейтинги
            for (const ranking of dup.rankings) {
                // Проверяем, нет ли уже такого рейтинга у главного
                const existingRanking = await prisma.rankingEntry.findFirst({
                    where: {
                        athleteId: primary.id,
                        category: ranking.category,
                        gender: ranking.gender,
                        type: ranking.type
                    }
                });

                if (!existingRanking) {
                    await prisma.rankingEntry.update({
                        where: { id: ranking.id },
                        data: { athleteId: primary.id }
                    });
                    console.log(`    Перенесён рейтинг: ${ranking.category}/${ranking.gender}/${ranking.type}`);
                } else {
                    // Удаляем дубликат рейтинга
                    await prisma.rankingEntry.delete({ where: { id: ranking.id } });
                    console.log(`    Удалён дубликат рейтинга: ${ranking.category}/${ranking.gender}/${ranking.type}`);
                }
            }

            // Переносим результаты турниров
            for (const result of dup.tournamentResults) {
                const existingResult = await prisma.tournamentResult.findFirst({
                    where: {
                        athleteId: primary.id,
                        tournamentCategoryId: result.tournamentCategoryId
                    }
                });

                if (!existingResult) {
                    await prisma.tournamentResult.update({
                        where: { id: result.id },
                        data: { athleteId: primary.id }
                    });
                    console.log(`    Перенесён результат турнира id=${result.id}`);
                } else {
                    await prisma.tournamentResult.delete({ where: { id: result.id } });
                }
            }

            // Переносим членство в сборной
            for (const membership of dup.nationalTeamMemberships) {
                const existingMembership = await prisma.nationalTeamMembership.findFirst({
                    where: {
                        athleteId: primary.id,
                        category: membership.category,
                        gender: membership.gender,
                        type: membership.type
                    }
                });

                if (!existingMembership) {
                    await prisma.nationalTeamMembership.update({
                        where: { id: membership.id },
                        data: { athleteId: primary.id }
                    });
                }
            }

            // Переносим регистрации
            for (const reg of dup.athleteRegistrations) {
                const existingReg = await prisma.athleteRegistration.findFirst({
                    where: {
                        athleteId: primary.id,
                        registrationId: reg.registrationId
                    }
                });

                if (!existingReg) {
                    await prisma.athleteRegistration.update({
                        where: { id: reg.id },
                        data: { athleteId: primary.id }
                    });
                }
            }

            // Удаляем дубликат атлета
            await prisma.athlete.delete({ where: { id: dup.id } });
            console.log(`    Удалён дубликат атлета id=${dup.id}`);
            deletedCount++;
        }

        mergedCount++;
    }

    // 2. Обновляем slug у всех остальных атлетов (убираем category/type из slug)
    console.log('\n=== Обновление slug у всех атлетов ===\n');

    const allAthletes = await prisma.athlete.findMany();
    let slugUpdated = 0;

    for (const athlete of allAthletes) {
        const newSlug = generateSlug(athlete.name);

        // Проверяем, отличается ли slug и нужно ли обновлять
        if (athlete.slug !== newSlug && athlete.slug.includes('-recurve-') ||
            athlete.slug.includes('-compound-') ||
            athlete.slug.includes('-adults-') ||
            athlete.slug.includes('-youth-') ||
            athlete.slug.includes('-juniors-') ||
            athlete.slug.includes('-cadets-') ||
            athlete.slug.includes('-cubs-')) {

            // Проверяем уникальность
            const existing = await prisma.athlete.findFirst({
                where: { slug: newSlug, id: { not: athlete.id } }
            });

            const finalSlug = existing ? `${newSlug}-${athlete.id}` : newSlug;

            await prisma.athlete.update({
                where: { id: athlete.id },
                data: { slug: finalSlug }
            });
            slugUpdated++;
        }
    }

    console.log(`\n=== Итоги ===`);
    console.log(`Объединено групп: ${mergedCount}`);
    console.log(`Удалено дубликатов: ${deletedCount}`);
    console.log(`Обновлено slug: ${slugUpdated}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
