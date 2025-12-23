// Kazakhstan timezone utilities
export const KZ_TIMEZONE = 'Asia/Almaty';
export const KZ_OFFSET = '+05:00';

/**
 * Format date for display in Kazakhstan timezone
 */
export function formatKZDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-KZ', {
    timeZone: KZ_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date with time for display in Kazakhstan timezone
 */
export function formatKZDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('ru-KZ', {
    timeZone: KZ_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format short date (DD.MM.YYYY) in Kazakhstan timezone
 */
export function formatKZDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-KZ', {
    timeZone: KZ_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format time only (HH:MM) in Kazakhstan timezone
 */
export function formatKZTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('ru-KZ', {
    timeZone: KZ_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert local KZ datetime string to UTC ISO string for database storage
 * Input: "2025-01-15T18:00" (what user entered, meaning KZ time)
 * Output: "2025-01-15T13:00:00.000Z" (UTC, 5 hours earlier)
 */
export function kzToUTC(localDateTimeString: string): string {
  // Append KZ offset to make it timezone-aware
  const date = new Date(localDateTimeString + KZ_OFFSET);
  return date.toISOString();
}

/**
 * Convert UTC date to local KZ datetime string for form inputs
 * Input: "2025-01-15T13:00:00.000Z" (UTC)
 * Output: "2025-01-15T18:00" (for datetime-local input)
 */
export function utcToKZInput(utcDate: Date | string): string {
  const date = new Date(utcDate);
  // Get KZ time components
  const kzDate = new Date(date.toLocaleString('en-US', { timeZone: KZ_TIMEZONE }));

  const year = kzDate.getFullYear();
  const month = String(kzDate.getMonth() + 1).padStart(2, '0');
  const day = String(kzDate.getDate()).padStart(2, '0');
  const hours = String(kzDate.getHours()).padStart(2, '0');
  const minutes = String(kzDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get current date in KZ timezone as YYYY-MM-DD
 */
export function getTodayKZ(): string {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: KZ_TIMEZONE });
}

/**
 * Check if a date is in the past (KZ timezone)
 */
export function isPastKZ(date: Date | string): boolean {
  const checkDate = new Date(date);
  const nowKZ = new Date(new Date().toLocaleString('en-US', { timeZone: KZ_TIMEZONE }));
  return checkDate < nowKZ;
}
