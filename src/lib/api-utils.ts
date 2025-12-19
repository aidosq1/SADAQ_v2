import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: errorResponse('Unauthorized', 401) };
  }

  const userRole = (session.user as { role?: string }).role;

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return { authorized: false, error: errorResponse('Forbidden', 403) };
  }

  return { authorized: true, session };
}

export function generateSlug(title: string): string {
  // Transliterate Cyrillic to Latin
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'і': 'i', 'ї': 'yi', 'є': 'ye', 'ғ': 'gh', 'қ': 'q', 'ң': 'ng',
    'ө': 'o', 'ұ': 'u', 'ү': 'u', 'һ': 'h', 'ә': 'a'
  };

  return title
    .toLowerCase()
    .split('')
    .map(char => cyrillicToLatin[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function parseQueryParams(searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const skip = (page - 1) * limit;

  return { limit, page, skip };
}
