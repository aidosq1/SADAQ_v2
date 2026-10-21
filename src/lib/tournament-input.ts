// Разбор дат турнира из формы админки

export class InvalidDateError extends Error {
  constructor(value: unknown) {
    super(`Некорректная дата: ${String(value)}`);
    this.name = 'InvalidDateError';
  }
}

// undefined — поле не передано, "" и null — поле очищено
export function parseDateInput(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw new InvalidDateError(value);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new InvalidDateError(value);
  }
  return date;
}

export function getTournamentDatesError(startDate: Date, endDate: Date): string | null {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Некорректные даты турнира';
  }
  if (endDate < startDate) {
    return 'Дата окончания раньше даты начала';
  }
  return null;
}
