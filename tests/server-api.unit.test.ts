/**
 * Тесты серверного запроса к своему API (данные для первого рендера страниц)
 * Запуск: npm run test:unit
 */
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchApi } from '../src/lib/server-api';

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

function mockFetch(handler: (url: string) => Promise<Response>): string[] {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return handler(String(input));
  }) as typeof fetch;
  console.error = () => {};
  return calls;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

test('возвращает ответ API целиком: data и meta', async () => {
  const calls = mockFetch(() => json({ success: true, data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 9 } }));
  const result = await fetchApi<{ id: number }[]>('/api/news?page=1');
  assert.deepEqual(result, { success: true, data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 9 } });
  assert.match(calls[0], /\/api\/news\?page=1$/);
});

test('HTTP-ошибка → undefined, клиент загрузит данные сам', async () => {
  mockFetch(() => json({ success: false, error: 'Not found' }, 404));
  assert.equal(await fetchApi('/api/tournaments/999'), undefined);
});

test('success: false → undefined', async () => {
  mockFetch(() => json({ success: false, error: 'Failed' }));
  assert.equal(await fetchApi('/api/stats'), undefined);
});

test('ответ без data → undefined', async () => {
  mockFetch(() => json({ ok: true }));
  assert.equal(await fetchApi('/api/stats'), undefined);
});

test('сеть недоступна → undefined, без исключения', async () => {
  mockFetch(() => Promise.reject(new Error('ECONNREFUSED')));
  assert.equal(await fetchApi('/api/stats'), undefined);
});
