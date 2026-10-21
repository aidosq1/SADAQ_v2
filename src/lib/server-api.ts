// Серверный запрос к собственному API для первого рендера страниц: HTML сразу
// приходит с данными (их видят поисковики), а клиент получает ровно тот JSON,
// который загрузил бы сам. undefined — клиент загрузит данные как раньше.

export interface ApiEnvelope<T> {
  success?: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const envelope = value as Partial<ApiEnvelope<unknown>>;
  return envelope.success !== false && envelope.data !== undefined;
}

export async function fetchApi<T>(path: string): Promise<ApiEnvelope<T> | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Server fetch ${path}: HTTP ${res.status}`);
      return undefined;
    }
    const body: unknown = await res.json();
    return isEnvelope(body) ? (body as ApiEnvelope<T>) : undefined;
  } catch (error) {
    console.error(`Server fetch ${path} failed:`, error);
    return undefined;
  }
}
