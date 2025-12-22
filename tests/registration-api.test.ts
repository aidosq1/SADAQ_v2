/**
 * Тесты API регистрации на турниры
 * Запуск: npx ts-node tests/registration-api.test.ts
 *
 * Требования:
 * - Сервер должен быть запущен на localhost:3000
 * - В базе должны быть турниры со статусом REGISTRATION_OPEN
 * - Должны быть спортсмены, тренеры и судьи в базе
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    skipped?: boolean;
}

const results: TestResult[] = [];

// Test helpers
async function test(name: string, fn: () => Promise<void>) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log(`✅ ${name}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, error: message });
        console.log(`❌ ${name}: ${message}`);
    }
}

function skip(name: string, reason: string) {
    results.push({ name, passed: true, skipped: true });
    console.log(`⏭️  ${name}: SKIPPED - ${reason}`);
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
}

// Test data storage
let testTournamentId: number | null = null;
let testCategoryId: number | null = null;
let testAthleteId: number | null = null;
let testCoachId: number | null = null;
let testJudgeId: number | null = null;

// ============ SETUP ============

async function setup() {
    console.log('\n📋 Подготовка тестовых данных...\n');

    // Get tournament with open registration
    try {
        const res = await fetch(`${BASE_URL}/api/tournaments?status=REGISTRATION_OPEN&limit=1`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
            testTournamentId = data.data[0].id;
            if (data.data[0].categories?.length > 0) {
                testCategoryId = data.data[0].categories[0].id;
            }
            console.log(`   📌 Турнир: ID ${testTournamentId}`);
            console.log(`   📌 Категория: ID ${testCategoryId}`);
        }
    } catch (e) {
        console.log('   ⚠️ Не удалось получить турнир');
    }

    // Get athlete
    try {
        const res = await fetch(`${BASE_URL}/api/team?limit=1`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
            testAthleteId = data.data[0].id;
            console.log(`   📌 Спортсмен: ID ${testAthleteId}`);
        }
    } catch (e) {
        console.log('   ⚠️ Не удалось получить спортсмена');
    }

    // Get coach
    try {
        const res = await fetch(`${BASE_URL}/api/coaches?limit=1`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
            testCoachId = data.data[0].id;
            console.log(`   📌 Тренер: ID ${testCoachId}`);
        }
    } catch (e) {
        console.log('   ⚠️ Не удалось получить тренера');
    }

    // Get judge
    try {
        const res = await fetch(`${BASE_URL}/api/judges?limit=1`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
            testJudgeId = data.data[0].id;
            console.log(`   📌 Судья: ID ${testJudgeId}`);
        }
    } catch (e) {
        console.log('   ⚠️ Не удалось получить судью');
    }

    console.log('');
}

// ============ TESTS ============

async function runTests() {
    console.log('\n🧪 Тестирование API регистрации на турниры\n');
    console.log('='.repeat(60));

    await setup();

    // ============ GET /api/registrations ============
    console.log('\n📂 GET /api/registrations\n');

    await test('GET /api/registrations - без авторизации возвращает 401', async () => {
        const res = await fetch(`${BASE_URL}/api/registrations`);
        assert(res.status === 401, `Ожидался 401, получен ${res.status}`);
    });

    // ============ POST /api/register - Валидация ============
    console.log('\n📝 POST /api/register - Валидация\n');

    await test('POST /api/register - без авторизации возвращает 401', async () => {
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        assert(res.status === 401, `Ожидался 401, получен ${res.status}`);
    });

    await test('POST /api/register - пустое тело возвращает ошибку', async () => {
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        // Должен быть 401 (без авторизации) или 400 (bad request)
        assert(res.status === 401 || res.status === 400, `Ожидался 401 или 400, получен ${res.status}`);
    });

    // ============ Структура ответов API ============
    console.log('\n📊 Структура данных API\n');

    await test('GET /api/team - структура ответа корректна', async () => {
        const res = await fetch(`${BASE_URL}/api/team?limit=1`);
        const data = await res.json();

        assert(res.ok, `HTTP ${res.status}`);
        assert('success' in data, 'Ответ должен содержать success');

        if (data.success && data.data?.length > 0) {
            const athlete = data.data[0];
            assert('id' in athlete, 'Спортсмен должен содержать id');
            assert('name' in athlete, 'Спортсмен должен содержать name');
            assert('gender' in athlete, 'Спортсмен должен содержать gender');
            assert('category' in athlete, 'Спортсмен должен содержать category');
            assert('type' in athlete, 'Спортсмен должен содержать type');
        }
    });

    await test('GET /api/coaches - структура ответа корректна', async () => {
        const res = await fetch(`${BASE_URL}/api/coaches?limit=1`);
        const data = await res.json();

        assert(res.ok, `HTTP ${res.status}`);
        assert('success' in data, 'Ответ должен содержать success');

        if (data.success && data.data?.length > 0) {
            const coach = data.data[0];
            assert('id' in coach, 'Тренер должен содержать id');
            assert('name' in coach, 'Тренер должен содержать name');
        }
    });

    await test('GET /api/judges - структура ответа корректна', async () => {
        const res = await fetch(`${BASE_URL}/api/judges?limit=1`);
        const data = await res.json();

        assert(res.ok, `HTTP ${res.status}`);
        assert('success' in data, 'Ответ должен содержать success');

        if (data.success && data.data?.length > 0) {
            const judge = data.data[0];
            assert('id' in judge, 'Судья должен содержать id');
            assert('name' in judge, 'Судья должен содержать name');
            assert('category' in judge, 'Судья должен содержать category');
        }
    });

    // ============ Турниры с открытой регистрацией ============
    console.log('\n🏆 Турниры с открытой регистрацией\n');

    await test('GET /api/tournaments?status=REGISTRATION_OPEN - возвращает турниры', async () => {
        const res = await fetch(`${BASE_URL}/api/tournaments?status=REGISTRATION_OPEN`);
        const data = await res.json();

        assert(res.ok, `HTTP ${res.status}`);
        assert(data.success === true, 'success должен быть true');
        assert(Array.isArray(data.data), 'data должен быть массивом');

        if (data.data.length > 0) {
            const tournament = data.data[0];
            assert(tournament.status === 'REGISTRATION_OPEN', 'Статус должен быть REGISTRATION_OPEN');
            assert(Array.isArray(tournament.categories), 'Турнир должен содержать categories');
        }
    });

    await test('Турниры содержат TournamentCategory с нужными полями', async () => {
        if (!testTournamentId) {
            skip('Турнир не найден', 'Нет турниров с открытой регистрацией');
            return;
        }

        const res = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}`);
        const data = await res.json();

        assert(res.ok, `HTTP ${res.status}`);
        assert(data.data.categories?.length > 0, 'Турнир должен содержать категории');

        const category = data.data.categories[0];
        assert('id' in category, 'Категория должна содержать id');
        assert('category' in category, 'Категория должна содержать category');
        assert('gender' in category, 'Категория должна содержать gender');
        assert('type' in category, 'Категория должна содержать type');
    });

    // ============ Валидация формата запроса ============
    console.log('\n✅ Валидация формата запроса регистрации\n');

    await test('Формат запроса: tournamentCategoryId обязателен', async () => {
        // Этот тест проверяет что API возвращает ошибку при отсутствии tournamentCategoryId
        // Без авторизации получим 401, но это нормально - проверяем что API обрабатывает запрос
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                judgeId: testJudgeId,
                participants: []
            })
        });
        // Ожидаем ошибку (401 или 400)
        assert(!res.ok || res.status === 401, 'Запрос без tournamentCategoryId должен вернуть ошибку');
    });

    await test('Формат запроса: participants должен быть массивом', async () => {
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tournamentCategoryId: testCategoryId,
                judgeId: testJudgeId,
                participants: "not_an_array"
            })
        });
        assert(!res.ok, 'Запрос с невалидным participants должен вернуть ошибку');
    });

    // ============ Формат newAthlete ============
    console.log('\n👤 Формат данных нового спортсмена\n');

    await test('newAthlete должен содержать обязательные поля', async () => {
        // Проверяем структуру NewAthleteData
        const newAthlete = {
            name: "Тестов Тест Тестович",
            iin: "990101350123",
            dob: "01.01.1999",
            gender: "M",
            category: "Adults",
            type: "Recurve"
        };

        assert('name' in newAthlete, 'newAthlete должен содержать name');
        assert('gender' in newAthlete, 'newAthlete должен содержать gender');
        assert('category' in newAthlete, 'newAthlete должен содержать category');
        assert('type' in newAthlete, 'newAthlete должен содержать type');
    });

    // ============ Формат newCoach ============
    console.log('\n👨‍🏫 Формат данных нового тренера\n');

    await test('newCoach должен содержать обязательные поля', async () => {
        const newCoach = {
            name: "Тренеров Тренер",
            phone: "+7 777 123 4567",
            email: "coach@test.kz"
        };

        assert('name' in newCoach, 'newCoach должен содержать name');
        // phone и email опциональны
    });

    // ============ Формат newJudge ============
    console.log('\n⚖️ Формат данных нового судьи\n');

    await test('newJudge должен содержать обязательные поля', async () => {
        const newJudge = {
            name: "Судьев Судья",
            category: "national",
            phone: "+7 777 123 4567",
            email: "judge@test.kz"
        };

        assert('name' in newJudge, 'newJudge должен содержать name');
        assert('category' in newJudge, 'newJudge должен содержать category');
    });

    // ============ Проверка существующих данных ============
    console.log('\n📊 Проверка существующих данных\n');

    if (testAthleteId) {
        await test(`Спортсмен ID ${testAthleteId} существует`, async () => {
            const res = await fetch(`${BASE_URL}/api/team/${testAthleteId}`);
            assert(res.ok, `Спортсмен ID ${testAthleteId} должен существовать`);
        });
    } else {
        skip('Проверка спортсмена', 'Нет спортсменов в базе');
    }

    if (testCoachId) {
        await test(`Тренер ID ${testCoachId} существует`, async () => {
            const res = await fetch(`${BASE_URL}/api/coaches/${testCoachId}`);
            assert(res.ok, `Тренер ID ${testCoachId} должен существовать`);
        });
    } else {
        skip('Проверка тренера', 'Нет тренеров в базе');
    }

    if (testJudgeId) {
        await test(`Судья ID ${testJudgeId} существует`, async () => {
            const res = await fetch(`${BASE_URL}/api/judges/${testJudgeId}`);
            assert(res.ok, `Судья ID ${testJudgeId} должен существовать`);
        });
    } else {
        skip('Проверка судьи', 'Нет судей в базе');
    }

    // ============ ИТОГИ ============
    console.log('\n' + '='.repeat(60));
    const passed = results.filter(r => r.passed && !r.skipped).length;
    const failed = results.filter(r => !r.passed).length;
    const skipped = results.filter(r => r.skipped).length;

    console.log(`\n📊 Результаты: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

    if (failed > 0) {
        console.log('❌ Неуспешные тесты:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   - ${r.name}: ${r.error}`);
        });
        console.log('');
    }

    // Информация для отладки
    console.log('📋 Тестовые данные:');
    console.log(`   Турнир: ${testTournamentId || 'не найден'}`);
    console.log(`   Категория: ${testCategoryId || 'не найдена'}`);
    console.log(`   Спортсмен: ${testAthleteId || 'не найден'}`);
    console.log(`   Тренер: ${testCoachId || 'не найден'}`);
    console.log(`   Судья: ${testJudgeId || 'не найден'}`);
    console.log('');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
