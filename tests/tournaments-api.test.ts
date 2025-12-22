/**
 * Базовые тесты API турниров
 * Запуск: npx ts-node tests/tournaments-api.test.ts
 *
 * Требования: сервер должен быть запущен на localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

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

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// ============ TESTS ============

async function runTests() {
  console.log('\n🧪 Тестирование API турниров\n');
  console.log('='.repeat(50));

  // GET /api/tournaments
  await test('GET /api/tournaments - должен вернуть список турниров', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    assert(data.success === true, 'success должен быть true');
    assert(Array.isArray(data.data), 'data должен быть массивом');
  });

  await test('GET /api/tournaments?limit=5 - лимит работает', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?limit=5`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    assert(data.data.length <= 5, 'Должно быть не более 5 элементов');
  });

  await test('GET /api/tournaments - турниры содержат categories', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?limit=1`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    if (data.data.length > 0) {
      const tournament = data.data[0];
      assert('categories' in tournament, 'Турнир должен содержать поле categories');
      assert(Array.isArray(tournament.categories), 'categories должен быть массивом');
    }
  });

  await test('GET /api/tournaments?type=Recurve - фильтр по типу лука', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?type=Recurve`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    // Если есть турниры, проверяем что они содержат Recurve категорию
    if (data.data.length > 0) {
      const hasRecurve = data.data.every((t: any) =>
        t.categories.some((c: any) => c.type === 'Recurve')
      );
      assert(hasRecurve, 'Все турниры должны содержать категорию Recurve');
    }
  });

  await test('GET /api/tournaments?category=Adults - фильтр по возрасту', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?category=Adults`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    if (data.data.length > 0) {
      const hasAdults = data.data.every((t: any) =>
        t.categories.some((c: any) => c.category === 'Adults')
      );
      assert(hasAdults, 'Все турниры должны содержать категорию Adults');
    }
  });

  // GET /api/tournaments/featured
  await test('GET /api/tournaments/featured - featured турнир', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments/featured`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    assert(data.success === true, 'success должен быть true');
    // data может быть null если нет featured турнира
    if (data.data) {
      assert('categories' in data.data, 'Featured турнир должен содержать categories');
    }
  });

  // GET /api/tournaments/[id]
  await test('GET /api/tournaments/:id - конкретный турнир', async () => {
    // Сначала получаем список
    const listRes = await fetch(`${BASE_URL}/api/tournaments?limit=1`);
    const listData = await listRes.json();

    if (listData.data.length > 0) {
      const id = listData.data[0].id;
      const res = await fetch(`${BASE_URL}/api/tournaments/${id}`);
      const data = await res.json();

      assert(res.ok, `HTTP ${res.status}`);
      assert(data.success === true, 'success должен быть true');
      assert(data.data.id === id, 'ID должен совпадать');
      assert(Array.isArray(data.data.categories), 'categories должен быть массивом');
    }
  });

  await test('GET /api/tournaments/999999 - несуществующий турнир', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments/999999`);
    const data = await res.json();

    assert(res.status === 404, 'Должен вернуть 404');
    assert(data.success === false, 'success должен быть false');
  });

  await test('GET /api/tournaments/invalid - невалидный ID', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments/invalid`);
    const data = await res.json();

    assert(res.status === 400, 'Должен вернуть 400');
  });

  // POST без авторизации
  await test('POST /api/tournaments - без авторизации должен вернуть 401', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Tournament',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        location: 'Test Location'
      })
    });

    assert(res.status === 401, 'Должен вернуть 401 Unauthorized');
  });

  // Структура категории
  await test('Структура TournamentCategory корректна', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?limit=10`);
    const data = await res.json();

    const tournamentWithCategories = data.data.find((t: any) => t.categories?.length > 0);

    if (tournamentWithCategories) {
      const category = tournamentWithCategories.categories[0];
      assert('id' in category, 'category должен содержать id');
      assert('category' in category, 'category должен содержать category');
      assert('gender' in category, 'category должен содержать gender');
      assert('type' in category, 'category должен содержать type');
      // regulationUrl находится на Tournament, не на TournamentCategory
    }
  });

  // Структура турнира с regulationUrl
  await test('Tournament содержит regulationUrl', async () => {
    const res = await fetch(`${BASE_URL}/api/tournaments?limit=1`);
    const data = await res.json();

    assert(res.ok, `HTTP ${res.status}`);
    if (data.data.length > 0) {
      const tournament = data.data[0];
      assert('regulationUrl' in tournament, 'tournament должен содержать regulationUrl');
    }
  });

  // Итоги
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Результаты: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Неуспешные тесты:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
