// Правила заявки на турнир — общие для API и страниц
import { isRegistrationAvailable, TournamentForStatus } from './tournament-utils';

export const MAX_ATHLETES_HOST_REGION = 6;
export const MAX_ATHLETES_GUEST_REGION = 4;

// На проверке и одобренные заявки занимают место региона в категории
const ACTIVE_STATUSES = ['PENDING', 'APPROVED'];

export function getMaxAthletes(isHostRegion: boolean): number {
  return isHostRegion ? MAX_ATHLETES_HOST_REGION : MAX_ATHLETES_GUEST_REGION;
}

export function isActiveRegistrationStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function findDuplicateIds(ids: ReadonlyArray<number | null | undefined>): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const id of ids) {
    if (id === null || id === undefined) continue;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

export interface EligibleAthlete {
  name: string;
  gender: string;
  regionId: number | null;
}

// regionId = null — регион не проверяется (заявку правит админ)
export function getAthleteEligibilityError(
  athlete: EligibleAthlete,
  category: { gender: string },
  regionId: number | null
): string | null {
  if (athlete.gender !== category.gender) {
    return `${athlete.name}: пол спортсмена не совпадает с категорией`;
  }
  if (regionId !== null && athlete.regionId !== regionId) {
    return `${athlete.name}: спортсмен из другого региона`;
  }
  return null;
}

// Регион правит свою заявку, пока она на проверке и приём заявок открыт
export function canOwnerEditRegistration(status: string, tournament: TournamentForStatus): boolean {
  return status === 'PENDING' && isRegistrationAvailable(tournament);
}
