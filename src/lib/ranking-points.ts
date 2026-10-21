// Очки за место в турнире — общие для API результатов и страницы ввода

const SENIOR_POINTS = [100, 90, 80, 70, 60, 50, 40, 30]; // Adults
const JUNIOR_POINTS = [70, 60, 50, 40, 30, 20, 10, 5];   // Youth, Juniors, Cadets, Cubs

export function calculatePoints(place: number, category: string): number {
  if (place < 1 || place > SENIOR_POINTS.length) return 0;

  const isSenior = category.toLowerCase() === 'adults';
  const points = isSenior ? SENIOR_POINTS : JUNIOR_POINTS;

  return points[place - 1];
}

export function isValidPlace(place: unknown): place is number {
  return typeof place === 'number' && Number.isInteger(place) && place >= 1;
}
